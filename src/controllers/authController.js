import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { COOKIES_KYES } from '../constants/index.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);

  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie(COOKIES_KYES.SESSION_ID);
  res.clearCookie(COOKIES_KYES.ACCESS_TOKEN);
  res.clearCookie(COOKIES_KYES.REFRESH_TOKEN);

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const session = await Session.findOne({
    _id: req.cookies[COOKIES_KYES.SESSION_ID],
    refreshToken: req.cookies[COOKIES_KYES.REFRESH_TOKEN],
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({
    _id: req.cookies[COOKIES_KYES.SESSION_ID],
    refreshToken: req.cookies[COOKIES_KYES.REFRESH_TOKEN],
  });

  const newSession = await createSession(session.userId);

  setSessionCookies(res, newSession);

  res.status(200).json({ message: 'Successfully refreshed a session!' });
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(400, 'Invalid user');
  }
  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '20m' },
  );

  const link = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${link}">here</a> to reset your password!</p>`,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({
    message: 'If this email exists, a reset link has been sent',
  });
};

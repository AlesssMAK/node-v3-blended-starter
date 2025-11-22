import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { COOKIES_KYES } from '../constants/index.js';

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

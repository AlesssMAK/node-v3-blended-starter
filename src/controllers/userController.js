import createHttpError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { User } from '../models/user.js';

export const updateUserAvatar = async (req, res) => {
  console.log(req.file);

  if (!req.file) {
    throw createHttpError(400, 'No file');
  }

  const result = await saveFileToCloudinary(req.file.buffer);

  const user = await User.findByIdAndUpdate(
    '693438b387182bcbd23eef94',
    { avatar: result.secure_url },
    { new: true },
  );

  console.log(user);

  res.status(200).json({ url: user.avatar });
};

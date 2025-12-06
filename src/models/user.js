import { model, Schema } from 'mongoose';
const userShema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    }
  },
  { timestamps: true, versionKey: false },
);

userShema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model('User', userShema);

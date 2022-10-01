import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  favoriteBooks: [
    {
      type: String,
      ref: 'Book',
    },
  ],
  favoriteMovies: [
    {
      type: String,
      ref: 'Movie',
    },
  ],
  favoriteTv: [
    {
      type: String,
      ref: 'Tv',
    },
  ],
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 25,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 25,
  },
  passwordToken: {
    type: mongoose.Types.ObjectId,
    ref: 'PasswordToken',
  },
  verificationToken: {
    type: mongoose.Types.ObjectId,
    ref: 'EmailToken',
  },
  profilePicture: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshTokens: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
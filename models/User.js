const mongoose = require('mongoose');

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
      unique: true,
    },
  ],
  favoriteMovies: [
    {
      type: String,
      ref: 'Movie',
      unique: true,
    },
  ],
  favoriteTv: [
    {
      type: String,
      ref: 'Tv',
      unique: true,
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
  // refreshToken: {
  //   type: String,
  // },
  refreshTokens: [{ type: String, unique: true }],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

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
      type: Number,
      ref: 'Book',
      unique: true,
    },
  ],
  favoriteMovies: [
    {
      type: Number,
      ref: 'Movie',
      unique: true,
    },
  ],
  favoriteTv: [
    {
      type: Number,
      ref: 'Tv',
      unique: true,
    },
  ],
  name: {
    type: String,
    required: true,
    minlength: 4,
  },
  passwordToken: {
    type: mongoose.Types.ObjectId,
    ref: 'PasswordToken'
  },
  verificationToken:{
    type: mongoose.Types.ObjectId,
    ref: 'EmailToken'
  },
  profilePicture:{
    type: String,
    default: null
  },
  isVerified:{
    type: Boolean,
    default: false
  },
  refreshToken:{
    type: String,
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

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
  username: {
    type: String,
    required: true,
    unique: true,
  },
  // bookmarks: [
  //   {
  //     //this will be the id from the external api
  //     type: Number, //mongoose.Types.ObjectId,
  //     ref: 'Media',
  //     unique: true,
  //   },
  // ],
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
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordTokenExpiration: {
    type: Date,
    default: null,
  },
  profilePhoto:{
    type: String,
    default: null
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

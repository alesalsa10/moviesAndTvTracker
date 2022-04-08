const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  user: {
    type: mongoose.Types.ObjectId, //for when the user creates a bookmark
    ref: 'User',
  },
  _id: String,

});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
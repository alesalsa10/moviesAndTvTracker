const mongoose = require('mongoose');

const TvSchema = new mongoose.Schema({
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  seasons: [
    {
      type: String, //this is the id for the season which is the same as the season id from the external api
      ref: 'Season',
    },
  ],
  _id: Number,
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
});

const Tv = mongoose.model('Tv', TvSchema);

module.exports = Tv;

const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  episodeNumber: {
    type: Number,
    required: true,
  },
  season: {
    type: mongoose.Types.ObjectId,
    ref: 'Season',
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  _id: String,
  commentCount: {
    type: Number,
    default: 0,
  },
});

const Episode = mongoose.model('Episode', episodeSchema);

module.exports = Episode;
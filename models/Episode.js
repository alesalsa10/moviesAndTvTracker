const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  episodeNumber: {
    type: Number,
    required: true,
  },
  season: {
    type: String,
    ref: 'Season',
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  _id: String,
});

const Episode = mongoose.model('Episode', episodeSchema);

module.exports = Episode;
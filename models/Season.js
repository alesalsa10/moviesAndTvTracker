const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema({
  episodes: [
    {
      type: String,
      ref: 'Episode',
    },
  ],
  seasonNumber: {
    type: Number,
    required: true,
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  _id: String, //id from external api simialr struc to the one on our own
  media: {
    type: Number, //id of the parent medie which is an unique number
    ref: 'Tv',
  },
  commentCount: {
    type: Number,
    default: 0,
  },
});

const Season = mongoose.model('Season', SeasonSchema);

module.exports = Season;

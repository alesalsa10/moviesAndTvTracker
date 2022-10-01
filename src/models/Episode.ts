import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema({
  episodeNumber: {
    type: Number,
    required: true,
  },
  season: {
    type: String,
    ref: 'Season',
  },
  seasonNumber: {
    type: Number,
    required: true,
  },

  mediaName: {
    type: String,
    required: true,
  },
  mediaId: {
    type: String,
    required: true,
  },

  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  _id: String,
  name: {
    type: String,
    required: true,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
});

const Episode = mongoose.model('Episode', episodeSchema);

export default Episode;
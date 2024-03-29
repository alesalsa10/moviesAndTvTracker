import mongoose from 'mongoose';

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
  //_id: String, //id from external api simialr struc to the one on our own
  externalId: String,
  media: {
    type: String, //id of the parent medie which is an unique number
    ref: 'Tv',
  },
  mediaName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
});

const Season = mongoose.model('Season', SeasonSchema);

export default Season;
import mongoose from 'mongoose';

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
  name: {
    type: String,
    required: true,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
});

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
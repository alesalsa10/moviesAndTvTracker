import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  _id: String,
  name: {
    type: String,
    required: true
  },
  commentCount: {
    type: Number,
    default: 0
  }
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
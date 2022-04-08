const mongoose = require('mongoose');

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
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  test: {
    type: String,
    required: true,
  },
  children: [
    {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: 'Comment',
    },
  ],
  datePosted: {
    type: Date,
    default: Date.now,
    required: true,
  },
  parentMedia: {
    //the movie or show is belongs to
    type: mongoose.Types.ObjectId,
    ref: 'Media',
  },
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;

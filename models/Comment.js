const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  test: {
    type: String,
    required: true,
  },
  replies: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Comment',
  },
  datePosted: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;

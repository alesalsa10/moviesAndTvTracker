const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  text: {
    type: String,
    required: true,
  },
  replies: [
    {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: 'Comment',
      default: [],
    },
  ],
  parentComment: {
    type: mongoose.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  datePosted: {
    type: Date,
    default: Date.now,
    required: true,
  },
  parentMediaId: {
    //the movie or show is belongs to
    type: Number,//mongoose.Types.ObjectId,
    ref: 'Media',
  },
  parentTv:{
    type: Number,
    ref: 'Season'
  },
  parentSeason:{
    type: String,
    ref: 'Episode'
  },
  parentEpisode:{
    type: Number,
    ref: 'Episode'
  },
  parentMovie:{
    type: Number,
    ref: 'Movie'
  },
  parentBook:{
    type: mongoose.Types.ObjectId,
    ref: 'Book'
  },
  parentCommentReplyCount:{
    type: Number,
    default: 0
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;

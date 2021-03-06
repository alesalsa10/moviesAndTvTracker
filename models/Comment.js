const mongoose = require('mongoose');
const User = require('../models/User');
const Episode = require('../models/Episode');
const Season = require('../models/Season');
const Tv = require('../models/Tv');
const Book = require('../models/Book');
const Movie = require('../models/Movie');
//get topComment id and only inc count of the topComment to sort by it

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
  editedAt: {
    type: Date,
    default: null,
  },
  parentTv: {
    type: String,
    ref: 'Tv',
  },
  parentSeason: {
    type: String,
    ref: 'Season',
  },
  parentEpisode: {
    type: String,
    ref: 'Episode',
  },
  parentMovie: {
    type: String,
    ref: 'Movie',
  },
  parentBook: {
    type: String,
    ref: 'Book',
  },
});

function autoPopulateReplies(next) {
  this.populate('replies');
  this.populate('postedBy', 'username');
  next();
}

CommentSchema.pre('findOne', autoPopulateReplies).pre(
  'find',
  autoPopulateReplies
);

CommentSchema.pre('save', async function (next) {
  //add to reply count before saving
  const selectModel = () => {
    if (this.parentTv) {
      return mongoose.model('Tv');
    } else if (this.parentSeason) {
      return mongoose.model('Season');
    } else if (this.parentEpisode) {
      return mongoose.model('Episode');
    } else if (this.parentMovie) {
      return mongoose.model('Movie');
    } else if (this.parentBook) {
      return mongoose.model('Book');
    } else {
      const err = new Error('Something went wrong');
      //next(err);
      return err;
    }
  };

  const selectParentMedia = () => {
    if (this.parentTv) {
      return this.parentTv;
    } else if (this.parentSeason) {
      return this.parentSeason;
    } else if (this.parentEpisode) {
      return this.parentEpisode;
    } else if (this.parentMovie) {
      return this.parentMovie;
    } else if (this.parentBook) {
      return this.parentBook;
    } else {
      const err = new Error('Something went wrong');
      //next(err);
      return err;
    }
  };

  let mongoModel = selectModel();
  let parentMediaType = selectParentMedia();
  if (mongoModel) {
    try {
      await mongoModel.findByIdAndUpdate(parentMediaType, {
        $inc: { commentCount: 1 },
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;

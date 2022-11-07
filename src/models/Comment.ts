import mongoose from 'mongoose';
import User from './User';
import Episode from './Episode';
import Season from './Season';
import Tv from './Tv';
import Book from './Book';
import Movie from './Movie';
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
  repliesCount: {
    type: Number,
    default: 0
  },
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
  votes: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Vote',
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

function autoPopulateReplies(next: Function) {
  this.populate('replies');
  this.populate('postedBy', 'username');
  next();
}

//look more into these later
// CommentSchema.pre('updateOne', function (next) {
//   this.set({ balance: this.get('upvote') - this.get('downvote') });

//   next();
// });

// CommentSchema.pre('save', function (next) {
//   this.set({ balance: this.get('upvote') - this.get('downvote') });

//   next();
// });

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

export default Comment;

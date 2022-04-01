const mongoose = require('mongoose');
const User = require('../models/User');
//get topComment id and only inc count of the topComment to sort by it

const CommentSchema = new mongoose.Schema(
  {
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
    parentTv: {
      type: String,
      ref: 'Season',
    },
    parentSeason: {
      type: String,
      ref: 'Season',
    },
    parentSeason: {
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const getRepliesCount = (comment, count = 0) => {
  //console.log(comment)
  if (comment.replies.length === 0) {
    return 1;
  }
  for (const reply of comment.replies) {
    count += getRepliesCount(reply, count);
  }
  return count;
};

CommentSchema.virtual('total').get(function () {
  return  getRepliesCount(this) + 1;
});

CommentSchema.pre('remove', async function (next) {
  //before removing remove comment from user, and from media, and decrement reply count
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
      //remove reference from the user
      await User.findByIdAndUpdate(this.postedBy, {
        $pull: {
          comments: this._id,
        },
      });
      try {
        //remove reference from the media and decrement count
        let media = await mongoModel.findByIdAndUpdate(this.parentMovie, {
          $pull: { comments: this._id },
        });
        if (media) {
          //dec
        } else {
          const err = new Error('Something went wrong 2');
          next(err);
        }
      } catch (error) {
        console.log(error);
        return next(error);
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;

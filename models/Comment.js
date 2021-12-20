const mongoose = require('mongoose');
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
  parentMediaId: {
    //the movie or show is belongs to
    type: Number, //mongoose.Types.ObjectId,
    ref: 'Media',
  },
  parentTv: {
    type: Number,
    ref: 'Season',
  },
  parentSeason: {
    type: String,
    ref: 'Season',
  },
  parentEpisode: {
    type: Number,
    ref: 'Episode',
  },
  parentMovie: {
    type: Number,
    ref: 'Movie',
  },
  parentBook: {
    type: mongoose.Types.ObjectId,
    ref: 'Book',
  },
  parentCommentReplyCount: {
    type: Number,
    default: 0,
  },
});

CommentSchema.pre('save', async function (next) {
  const selectModel = () => {
    console.log(this, 'something');
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
      next(err);
    }
  };

  let mongoModel = selectModel();

  if (mongoModel) {
    try {
      let media = await mongoModel.findByIdAndUpdate(this.parentMovie, {
        $inc: { commentCount: 1 },
      });
      if (media) {
        //next();
        //still not working
        if (this.parentComment) {
          try {
            let com = await Comment.findByIdAndUpdate(this.parentComment, {
              $inc: { parentCommentReplyCount: 1 },
            });
            if (com) {
              next();
            } else {
              const err = new Error('Something went wrong 1');
              next(err);
            }
          } catch (error) {
            console.log(error);
            return next(error);
          }
        } else {
          next();
        }
      } else {
        const err = new Error('Something went wrong 2');
        next(err);
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;

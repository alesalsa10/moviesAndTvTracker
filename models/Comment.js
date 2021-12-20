const mongoose = require('mongoose');
const chooseModel = require('../utils/chooseModel');

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
    ref: 'Season'
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


CommentSchema.pre('save', async function (next) {
  let model;
  if(this.parentTv){
    model = chooseModel('tv');
  }else if(this.parentSeason){
    model = chooseModel('season');
  }else if(this.parentEpisode){
    model = chooseModel('episode');
  }else if(this.parentMovie){
    model = chooseModel('movie');
  }else if(this.parentBook){
    model = chooseModel('book')
  }else {
    model = null
    const err = new Error('Something went wrong');
    next(err);
  }

  if(model){
    try{
      let media = await model.findByIdAndUpdate(
        this.parentMovie,
        {
          $inc: { commentCount: 1 },
        }
      );
      console.log({'media': media})
      if(media){
        //next();
        //still not working
        if(this.parentComment){
          try{
            let com = await Comment.findByIdAndUpdate(
              this.parentComment,
              {
                $inc: { parentCommentReplyCount: 1 },
              }            
            );
            console.log({'com': com})
            if(com){
              next();
            }else {
              const err = new Error('Something went wrong');
              next(err);
            }
          }catch(error){
            console.log(error);
            return next(error);
          }
        }else {
          next()
        }
      }else {
        const err = new Error('Something went wrong');
        next(err)
      }
      console.log(media)
    }catch(error){
      console.log(error)
      return next(error)
    }

  }
});


const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;

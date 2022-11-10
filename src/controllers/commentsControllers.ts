import User from '../models/User';
import Comment from '../models/Comment';
import chooseCommentParent from '../utils/chooseCommentParent';
import Selector from '../utils/selector';
import mongoose, { ObjectId } from 'mongoose';
import { Request, Response } from 'express';
import Vote from '../models/Vote';
//make it so if comment value == '[Deleted]' this type of comment cannot be deleted since this is only used a reference key
interface UserAuth extends Request {
  user: string; // or any other type
}

const createComment = async (req: UserAuth, res: Response) => {
  const text: string = req.body.text;
  const userId = req.user;
  const { id } = req.params;

  // const userId = req.header('userId');
  // const externalId = req.header('externalId');
  const { mediaType } = req.params;
  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      const selector = new Selector();
      let model: any = selector.chooseModel(mediaType);
      if (!model) {
        return res.status(500).json({ Msg: 'This model does not exist' });
      } else {
        try {
          let existingMedia: any = await model.findById(id);
          if (existingMedia) {
            try {
              let commentParentMedia = chooseCommentParent(mediaType);
              let newComment = new Comment({
                postedBy: userId,
                [commentParentMedia]: existingMedia._id,
                text,
              });
              await newComment.save();
              //await foundUser.comments.push(newComment);
              //await foundUser.save();
              await User.findByIdAndUpdate(req.user, {
                $push: { comments: newComment },
              });
              await existingMedia.comments.push(newComment);
              await existingMedia.save();
              newComment = await Comment.findById(newComment._id).populate(
                'postedBy',
                'username'
              );
              return res.status(201).json(newComment);
            } catch (error) {
              console.log(error);
              return res
                .status(500)
                .json('Something went wrong while saving your comment');
            }
          } else {
            return res
              .status(404)
              .json({ Msg: 'Error finding this media, try again later' });
          }
        } catch (err) {
          console.log(err);
          return res
            .status(500)
            .json({ Msg: 'Something went wrong trying to find the media' });
        }
      }
    } else {
      res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const replyToComment = async (req: UserAuth, res: Response) => {
  //const { text, parentCommentId } = req.body;
  const text: string = req.body.text;
  const parentCommentId: string = req.body.parentCommentId;
  const userId = req.user;
  const { mediaType, id } = req.params;
  console.log(mediaType, id);
  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      //let model = chooseModel(mediaType);
      const selector = new Selector();
      let model: any = selector.chooseModel(mediaType);
      if (!model) {
        return res
          .status(500)
          .json({ Msg: 'This media type does not exist our database' });
      } else {
        try {
          let foundMedia: any = await model.findById(id);
          console.log(foundMedia);
          if (foundMedia) {
            try {
              let foundComment = await Comment.findById(parentCommentId);
              if (foundComment) {
                let commentParentMedia = chooseCommentParent(mediaType);
                let newComment = new Comment({
                  postedBy: userId,
                  [commentParentMedia]: foundMedia._id,
                  text,
                  parentComment: parentCommentId,
                });
                await newComment.save();

                await User.findByIdAndUpdate(req.user, {
                  $push: { comments: newComment },
                });

                await Comment.findByIdAndUpdate(foundComment._id, {
                  $push: { replies: newComment },
                  $inc: { voteCount: 1 },
                });
                newComment = await Comment.findById(newComment._id).populate(
                  'postedBy',
                  'username'
                );

                return res.status(200).json(newComment);
              } else {
                return res
                  .status(404)
                  .json({ Msg: 'Invalid comment parent id' });
              }
            } catch (error) {
              console.log(error);
              return res
                .status(500)
                .json({ Msg: 'Something went wrong, try again later' });
            }
          } else {
            return res.status(404).json({ Msg: 'Media not found' });
          }
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .json({ Msg: 'Something went wrong, try again later' });
        }
      }
    } else {
      res.status(404).json({ Msg: 'Invalid user id' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const editComment = async (req: Request, res: Response) => {
  //unable to update if not test == 'detelete'
  const commentId: string = req.params.commentId;
  const { text } = req.body;

  try {
    let comment = await Comment.findById(commentId);
    if (comment.text === '[Deleted]') {
      return res.status(401).json({ Msg: `Can't edit deleted comments` });
    } else {
      try {
        const update = {
          text,
          editedAt: Date.now(),
        };
        let foundComment = await Comment.findByIdAndUpdate(commentId, update, {
          new: true,
        });
        res.status(202).json(foundComment);
      } catch (error) {
        console.log(error);
        res.status(500).json({ Msg: 'Something went wrong' });
      }
    }
  } catch (err) {}
};

const deleteComment = async (req: Request, res: Response) => {
  //to delete the comment, I will onyl delete the content and replace it with ['deleted']
  //this will be done so the threaded comment can still be looked up, how reddit works
  //only do the 'deleted' logic if the comment has replies
  //make sure to delete comment from user and media
  const commentId: string = req.params.commentId;
  const parentCommentId: string = req.body.parentCommentId as string;
  try {
    const update = {
      text: '[Deleted]',
    };
    //lookup comment
    //if found look up replies array
    //if it is empty delete everything about the comment
    //else change it to [deleted] this is done to keep the nested chain by lookup of parent comment
    let comment = await Comment.findById(commentId);
    if (comment) {
      let repliesLength = comment.replies.length;
      if (repliesLength > 0) {
        comment = await Comment.findByIdAndUpdate(comment._id, update, {
          new: true,
        });
        res.status(200).json(comment);
      } else {
        try {
          const selectModel = () => {
            if (comment.parentTv) {
              return mongoose.model('Tv');
            } else if (comment.parentSeason) {
              return mongoose.model('Season');
            } else if (comment.parentEpisode) {
              return mongoose.model('Episode');
            } else if (comment.parentMovie) {
              return mongoose.model('Movie');
            } else if (comment.parentBook) {
              return mongoose.model('Book');
            }
          };

          const selectParentMedia = () => {
            if (comment.parentTv) {
              return comment.parentTv;
            } else if (comment.parentSeason) {
              return comment.parentSeason;
            } else if (comment.parentEpisode) {
              return comment.parentEpisode;
            } else if (comment.parentMovie) {
              return comment.parentMovie;
            } else if (comment.parentBook) {
              return comment.parentBook;
            }
          };
          let mongoModel = selectModel();
          let parentMediaType = selectParentMedia();
          await mongoModel.findByIdAndUpdate(parentMediaType, {
            $pull: { comments: comment._id },
            $inc: { commentCount: -1 },
          });
          await User.findByIdAndUpdate(comment.postedBy, {
            $pull: {
              comments: comment._id,
            },
          });

          //if parentComment
          if (comment.parentComment) {
            try {
              //find parentcomment and decrement repliesCount
              await Comment.findByIdAndUpdate(comment.parentComment, {
                $inc: { repliesCount: -1 },
              });
            } catch (error) {
              console.log(error);
            }
          }

          try {
            await Comment.findByIdAndDelete(comment._id); //IMPORTANT
            console.log('was deleted');
          } catch (error) {
            console.log(error);
            return res.status(500).json({
              Msg: 'Something went wrong, try again later',
            });
          }
          res.status(200).json({ Msg: 'Complete Deletion' });
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .json({ Msg: 'Something went wrong deleting your comment' });
        }
      }
    } else {
      res.status(404).json({ Msg: 'No comment with given id was found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const getComments = async (req: UserAuth, res: Response) => {
  //req.user is undefined since this is an open route and the middleware does not need to run
  //need an laternative method
  const { mediaType, id } = req.params;
  let sort: string = req.query.sort as string;
  let parent: string = chooseCommentParent(mediaType);
  if (!parent) {
    return res.status(404).json({ Msg: 'Invalid media type' });
  }
  // switch (mediaType) {
  //   case 'movie':
  //     parent = 'parentMovie';
  //     break;
  //   case 'tv':
  //     parent = 'parentTv';
  //     break;
  //   case 'season':
  //     parent = 'parentSeason';
  //     break;
  //   case 'episode':
  //     parent = 'parentEpisode';
  //     break;
  //   case 'book':
  //     parent = 'parentBook';
  //     break;
  //   default:
  //     parent = null;
  //     break;
  // }

  console.log(parent, 13);
  if (!mediaType) {
    return res.status(400).json({ Msg: 'Not a valid media type' });
  } else {
    try {
      if (sort === 'replies') {
        let comments = await Comment.find({
          [parent]: id,
          parentComment: null,
        })
          .populate({ path: 'votes', match: { postedBy: req.user } }) //should only be one
          .sort({ repliesCount: -1 })
          .lean();
        return res.status(200).json(comments);
      } else if (sort === 'popularity') {
        let comments = await Comment.find({
          [parent]: id,
          parentComment: null,
        })
          .populate({ path: 'votes', match: { postedBy: req.user } }) //should only be one
          .sort({ voteCount: -1 })
          .lean();
        return res.status(200).json(comments);
      }

      let comments = await Comment.find({
        [parent]: id,
        parentComment: null,
      })
        .populate({ path: 'votes', match: { postedBy: req.user } }) //should only be one
        .sort({ datePosted: -1 })
        .lean();
      return res.status(200).json(comments);
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ Msg: 'Error getting comments, try again later' });
    }
  }
};

const vote = async (req: UserAuth, res: Response) => {
  const commentId: string = req.params.commentId;
  const isUpvote: boolean = req.body.isUpvote as boolean;
  //console.log(isUpvote);
  try {
    let comment = await Comment.findById(commentId);
    //console.log(comment);
    if (comment) {
      try {
        let vote: any;
        try {
          vote = await Vote.findOne({ postedBy: req.user, comment: commentId });
          if (!vote) {
            try {
              vote = new Vote({
                comment: commentId,
                postedBy: req.user,
              });
              await vote.save();
            } catch (error) {
              return res.status(500).json({
                Msg: 'Something went wrong, try again later',
              });
            }
          }
        } catch (error) {
          return res
            .status(500)
            .json({ Msg: 'Something went wrong, try again later' });
        }
        console.log({ vote: vote.value });
        let voteVal: Number = parseInt(vote.value);
        let updatedVoteVal: Number;

        let newVote: any;
        if (isUpvote && voteVal === 1) {
          console.log('up and 1');
          // if upvote && existing vote value == 1, already upvoted, just do -1 to reset
          try {
            updatedVoteVal = -1;
            newVote = await Vote.findByIdAndUpdate(vote._id, {
              value: 0,
            });
          } catch (error) {
            return res.status(500).json({
              Msg: 'Something went wrong while upvoting',
            });
          }
        } else if (isUpvote && voteVal === -1) {
          console.log('up and -1');
          updatedVoteVal = 2;
          // if upvote && existing vote value == -1, update vote value to 0 (zero).
          try {
            newVote = await Vote.findByIdAndUpdate(vote._id, {
              value: 1,
            });
          } catch (error) {
            return res.status(500).json({
              Msg: 'Something went wrong while upvoting',
            });
          }
        } else if (isUpvote && voteVal === 0) {
          //if upvote && existing vote value == 0, update vote value to 1
          updatedVoteVal = 1;
          try {
            newVote = await Vote.findByIdAndUpdate(vote._id, {
              value: 1,
            });
            console.log('upvoted and value was 0');
          } catch (error) {
            return res.status(500).json({
              Msg: 'Something went wrong while upvoting',
            });
          }
        } else if (!isUpvote && voteVal === 0) {
          console.log('down and 0');
          updatedVoteVal = -1;
          //if downvote && existing vote value == 1, update vote value to 0 (zero).
          try {
            newVote = await Vote.findByIdAndUpdate(vote._id, {
              value: -1,
            });
          } catch (error) {
            return res.status(500).json({
              Msg: 'Something went wrong while downvoting',
            });
          }
        } else if (!isUpvote && voteVal === -1) {
          console.log('down and -1');
          updatedVoteVal = 1;
          //if downvote && existing vote value == -1, already downvoted, send message "cannot downvote again". No update happens.
          try {
            newVote = await Vote.findByIdAndUpdate(vote._id, {
              value: 0,
            });
          } catch (error) {
            return res
              .status(500)
              .json({ Msg: 'Something went wrong while downvoting' });
          }
        } else {
          console.log('down and 1');
          updatedVoteVal = -2;
          //if downvote && existing vote value == 1, update vote value to 0
          try {
            newVote = await Vote.findByIdAndUpdate(vote._id, {
              value: -1,
            });
          } catch (error) {
            return res
              .status(500)
              .json({ Msg: 'Something went wrong while downvoting' });
          }
        }
        //add the vote to the comment

        try {
          let updatedComment = await Comment.findByIdAndUpdate(commentId, {
            $addToSet: { votes: newVote },
            $inc: { voteCount: updatedVoteVal },
          },
          {
            new: true,
          }
          ).populate({ path: 'votes', match: { postedBy: req.user } }); 

          return res.status(200).json(updatedComment);
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .json({ Msg: 'There was a problem, try again later' });
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ Msg: 'There was a problem voting' });
      }
    } else {
      return res.status(404).json({ Msg: 'Comment not found' });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ Msg: 'Error finding this comment, try again later' });
  }
};

export = {
  createComment,
  replyToComment,
  editComment,
  deleteComment,
  getComments,
  vote,
};

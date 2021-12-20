const User = require('../models/User');
const Comment = require('../models/Comment');
const chooseModel = require('../utils/chooseModel');
const chooseCommentParent = require('../utils/chooseCommentParent');

const createComment = async (req, res) => {
  const { text } = req.body;
  const userId = req.header('userId');
  const externalId = req.header('externalId');
  const { mediaType } = req.params;

  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      // let existingMedia = await getMedia(externalId, mediaType);
      // console.log(existingMedia);
      //check if the media exist, it doesn't create it
      let model = chooseModel(mediaType);
      if (!model) {
        return res.status(500).json({ Msg: 'This model does not exist' });
      } else {
        try {
          let existingMedia = await model.findById(externalId);
          if (existingMedia) {
            //comments don't have the right references parentMovie, parentTv, stc.
            try {
              let commentParentMedia = chooseCommentParent(mediaType);
              let newComment = new Comment({
                postedBy: userId,
                [commentParentMedia]: existingMedia._id,
                text,
              });
              await newComment.save();
              await foundUser.comments.push(newComment);
              await foundUser.save();
              await existingMedia.comments.push(newComment);
              await existingMedia.save();
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
        // try {
        //   await model.findOneAndUpdate(
        //     { _id: externalId },
        //     {
        //       $inc: { commentCount: 1 },
        //     }
        //   );
        //   return res.status(201).json({ Msg: 'Comment created' });
        // } catch (err) {
        //   return res
        //     .status(500)
        //     .json({ Msg: 'Problem increasing comment count' });
        // }
        return res.status(201).json({ Msg: 'Comment created' });
      }
    } else {
      res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const replyToComment = async (req, res) => {
  //find parentComment by id
  //create the new comment and add it to the replies inside of comment
  //REFACTOR WITH NEW MODEL UTILITY
  const { text } = req.body;
  const userId = req.header('userId');
  const parentCommentId = req.header('parentCommentId');
  const parentMediaId = req.header('parentMediaId');
  const { mediaType } = req.params;

  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      let model = chooseModel(mediaType);
      if (!model) {
        return res
          .status(500)
          .json({ Msg: 'This media type does not exist our database' });
      } else {
        try {
          let foundMedia = await model.findById(parentMediaId);
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
                await foundUser.comments.push(newComment);
                await foundUser.save();
                await foundComment.replies.push(newComment);
                await foundComment.save();
                return res.status(200).json({ Msg: 'Success reply' });
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

const editComment = async (req, res) => {
  //unable to update if not test == 'detelete'
  const commentId = req.header('commentId');
  const { text } = req.body;
  try {
    const update = {
      text,
    };
    let foundComment = await Comment.findByIdAndUpdate(commentId, update, {
      new: true,
    });
    if (foundComment) {
      res.status(202).json({ foundComment });
    } else {
      res.status(404).json({ Msg: 'No comment with given id was found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const deleteComment = async (req, res) => {
  //to delete the comment, I will onyl delete the content and replace it with ['deleted']
  //this will be done so the threaded comment can still be looked up, how reddit works
  //only do the 'deleted' logic if the comment has replies
  //make sure to delete comment from user and media
  const commentId = req.header('commentId');
  //need parent mediaId (movie/tv/season/episode) and userId
  const userId = req.header('userId');
  const { mediaType } = req.params;
  const parentCommentId = req.header('parentCommentId') || undefined;
  const parentMediaId = req.header('parentMediaId');

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
        await Comment.findByIdAndUpdate(commentId, update, { new: true });
        res.status(202).json({ Msg: 'Comment deleted' });
      } else {
        await Comment.findByIdAndDelete(commentId); //IMPORTANT
        //res.status(202).json({ Msg: 'Comment deleted' });
        //remove reference from user
        try {
          await User.findOneAndUpdate(
            { _id: userId },
            {
              $pull: {
                comments: commentId,
              },
            }
          );
        } catch (err) {
          console.log(err);
          res
            .status(500)
            .json({ Msg: 'Something went wrong while deleting comment' });
        }
        let model = chooseModel(mediaType);
        if (!model) {
          return res.status(500).json({ Msg: 'Invalid media type' });
        } else {
          try {
            //dec comment count
            await model.findByIdAndUpdate(
              { _id: parentMediaId },
              {
                $inc: { commentCount: -1 },
              },
              {
                $pull: {
                  comments: parentCommentId,
                },
              }
            );

            //return res.status(202).json({ Msg: 'Comment deleted' });
          } catch (err) {
            console.log(error);
            return res.status(500).json({
              Msg: 'Something went wrong',
            });
          }
        }
        res.status(200).json({ Msg: 'Comment deleted' });
        // let foundMedia = await getMedia(
        //   parentMediaId,
        //   mediaType,
        //   true,
        //   commentId
        // );
        // if (foundMedia) {
        //   if (parentCommentId) {
        //     try {
        //       await Comment.findOneAndUpdate(
        //         { _id: parentCommentId },
        //         {
        //           $pull: {
        //             replies: commentId,
        //           },
        //         }
        //       );
        //       //return res.status(202).json({ Msg: 'Comment deleted' });

        //     } catch (err) {
        //       console.log(err);
        //       res.status(500).json({
        //         Msg: 'Something went wrong while deleting your comment',
        //       });
        //     }
        //   }
        //   // switch (mediaType) {
        //   //   case 'movie':
        //   //     console.log('movie');
        //   //     try {
        //   //       await Movie.findByIdAndUpdate(
        //   //         { _id: parentMediaId },
        //   //         {
        //   //           $inc: { commentCount: -1 },
        //   //         }
        //   //       );
        //   //     } catch (error) {
        //   //       console.log(error);
        //   //       return res.status(500).json({
        //   //         Msg: 'Something went wrong deleting your comment',
        //   //       });
        //   //     }
        //   //     break;
        //   //   case 'Tv':
        //   //     try {
        //   //       await Tv.findByIdAndUpdate(
        //   //         { _id: parentMediaId },
        //   //         {
        //   //           $inc: { commentCount: -1 },
        //   //         }
        //   //       );
        //   //     } catch (error) {
        //   //       console.log(error);
        //   //       return res.status(500).json({
        //   //         Msg: 'Something went wrong deleting your comment',
        //   //       });
        //   //     }
        //   //     break;
        //   //   case 'Season':
        //   //     try {
        //   //       await Season.findByIdAndUpdate(
        //   //         { _id: parentMediaId },
        //   //         {
        //   //           $inc: { commentCount: -1 },
        //   //         }
        //   //       );
        //   //     } catch (error) {
        //   //       console.log(error);
        //   //       return res.status(500).json({
        //   //         Msg: 'Something went wrong deleting your comment',
        //   //       });
        //   //     }
        //   //     break;
        //   //   case 'Episode':
        //   //     try {
        //   //       await Episode.findByIdAndUpdate(
        //   //         { _id: parentMediaId },
        //   //         {
        //   //           $inc: { commentCount: -1 },
        //   //         }
        //   //       );
        //   //     } catch (error) {
        //   //       console.log(error);
        //   //       return res.status(500).json({
        //   //         Msg: 'Something went wrong deleting your comment',
        //   //       });
        //   //     }
        //   //     break;
        //   //   case 'Book':
        //   //     try {
        //   //       await Book.findByIdAndUpdate(
        //   //         { _id: parentMediaId },
        //   //         {
        //   //           $inc: { commentCount: -1 },
        //   //         }
        //   //       );
        //   //     } catch (error) {
        //   //       console.log(error);
        //   //       return res.status(500).json({
        //   //         Msg: 'Something went wrong deleting your comment',
        //   //       });
        //   //     }
        //   //     break;
        //   // }
        //   //return res.status(202).json({ Msg: 'Comment deleted' });
        // } else {
        //   res.status(404).json({ Msg: 'Media not found' });
        // }
      }
    } else {
      res.status(404).json({ Msg: 'No comment with given id was found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

module.exports = {
  createComment,
  replyToComment,
  editComment,
  deleteComment,
};

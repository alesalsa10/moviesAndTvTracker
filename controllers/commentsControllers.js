const User = require('../models/User');
const Comment = require('../models/Comment');
const chooseCommentParent = require('../utils/chooseCommentParent');
const Selector = require('../utils/selector');

//make it so if comment value == '[Deleted]' this type of comment cannot be deleted since this is only used a reference key

const createComment = async (req, res) => {
  const { text } = req.body;
  const userId = req.user;
  const { id } = req.params;

  // const userId = req.header('userId');
  // const externalId = req.header('externalId');
  const { mediaType } = req.params;
  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      const selector = new Selector();
      let model = selector.chooseModel(mediaType);
      console.log(model);
      if (!model) {
        return res.status(500).json({ Msg: 'This model does not exist' });
      } else {
        try {
          let existingMedia = await model.findById(id);
          console.log(existingMedia);

          existingMedia.commentCount++;
          await existingMedia.save();
          if (existingMedia) {
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
              newComment = await Comment.findById(newComment._id).populate(
                'postedBy',
                'name'
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

const replyToComment = async (req, res) => {
  const { text, parentCommentId } = req.body;
  const userId = req.user;
  const { mediaType, id } = req.params;
  console.log(mediaType, id);
  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      //let model = chooseModel(mediaType);
      const selector = new Selector();
      let model = selector.chooseModel(mediaType);
      if (!model) {
        return res
          .status(500)
          .json({ Msg: 'This media type does not exist our database' });
      } else {
        try {
          let foundMedia = await model.findById(id);
          foundMedia.commentCount++;
          await foundMedia.save();
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
                await foundUser.comments.push(newComment);
                await foundUser.save();
                await foundComment.replies.push(newComment);
                await foundComment.save();
                newComment = await Comment.findById(newComment._id).populate(
                  'postedBy',
                  'name'
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

const editComment = async (req, res) => {
  //unable to update if not test == 'detelete'
  const commentId = req.params.commentId;
  const { text } = req.body;

  try {
    let comment = await Comment.findById(commentId);
    if (comment.text === '[Deleted]') {
      return res.status(401).json({ Msg: `Can't edit deleted comments` });
    } else {
      try {
        const update = {
          text,
        };
        let foundComment = await Comment.findByIdAndUpdate(commentId, update, {
          new: true,
        });
        res.status(202).json({ foundComment });
      } catch (error) {
        console.log(error);
        res.status(500).json({ Msg: 'Something went wrong' });
      }
    }
  } catch (err) {}
};

const deleteComment = async (req, res) => {
  //to delete the comment, I will onyl delete the content and replace it with ['deleted']
  //this will be done so the threaded comment can still be looked up, how reddit works
  //only do the 'deleted' logic if the comment has replies
  //make sure to delete comment from user and media
  const commentId = req.params.commentId;
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
        comment = await Comment.findByIdAndUpdate(commentId, update, { new: true });
        res.status(200).json(comment);
      } else {
        try {
          let deleted = await Comment.findByIdAndDelete(commentId); //IMPORTANT
          if (deleted) {
            res.status(200).json( {Msg: 'Complete Deletion'} );
          } else {
            res
              .status(500)
              .json({ Msg: 'There was an issue deleting your comment' });
          }
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

const getComments = async (req, res) => {
  const { mediaType, id } = req.params;
  let parent;
  switch (mediaType) {
    case 'movie':
      parent = 'parentMovie';
      break;
    case 'tv':
      parent = 'parentTv';
      break;
    case 'season':
      parent = 'parentSeason';
      break;
    case 'episode':
      parent = 'parentEpisode';
      break;
    case 'book':
      parent = 'parentBook';
      break;
    default:
      parent = null;
      break;
  }
  console.log(parent);
  if (!mediaType) {
    return res.status(400).json({ Msg: 'Not a valid media type' });
  } else {
    try {
      let comments = await Comment.find({
        [parent]: id,
        parentComment: null,
      })
        .sort({ datePosted: -1 })
        .lean();
       console.log(comments)
      return res.status(200).json(comments);
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ Msg: 'Error getting comments, try again later' });
    }
  }
};

module.exports = {
  createComment,
  replyToComment,
  editComment,
  deleteComment,
  getComments,
};

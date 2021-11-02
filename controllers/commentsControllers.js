const User = require('../models/User');
const Media = require('../models/Media');
const Comment = require('../models/Comment');

const createComment = async (req, res) => {
  const { mediaType, text } = req.body;
  const userId = req.header('userId');
  const externalId = req.header('externalId');

  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      let existingMedia = await Media.findOne({ externalId });
      //check if the media exist, it doesn't create it
      if (existingMedia) {
        //create comment object with fields: postedBy, text, parentMediaId: externalId
        let newComment = new Comment({
          postedBy: userId,
          parentMediaId: existingMedia._id,
          text,
        });

        await newComment.save();
        await foundUser.comments.push(newComment);
        await foundUser.save();
        await existingMedia.comments.push(newComment);
        await existingMedia.save();

        res.status(201).json({ Msg: 'Comment created' });
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
  const { text } = req.body;
  const userId = req.header('userId');
  const parentCommentId = req.header('parentCommentId');
  const parentMediaId = req.header('parentMediaId');

  try {
    let foundUser = await User.findById(userId).select('-password');
    if (foundUser) {
      try {
        let foundMedia = await Media.findById(parentMediaId);
        if (foundMedia) {
          try {
            let foundComment = await Comment.findById(parentCommentId);
            if (foundComment) {
              let newComment = new Comment({
                postedBy: userId,
                parentMediaId: foundMedia._id,
                text,
                parentComment: parentCommentId,
              });
              await newComment.save();
              await foundUser.comments.push(newComment);
              await foundUser.save();
              await foundComment.replies.push(newComment);
              await foundComment.save();
              res.status(200).json({ Msg: 'Successful reply' });
            } else {
              res.status(404).json({ Msg: 'Invalid comment id' });
            }
          } catch (error) {
            console.log(error);
            res.status(500).json({ Msg: 'Something went wrong' });
          }
        } else {
          res.status(404).json({ Msg: 'Invalid parent media id' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ Msg: 'Something went wrong' });
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
  const commentId = req.header('commentId');
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
        res.status(202).json({ Msg: 'Comment deleted ' });
      } else {
        await Comment.findByIdAndDelete(commentId);
        res.status(202).json({ Msg: 'Comment deleted 2' });
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

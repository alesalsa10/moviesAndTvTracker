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
      } else {
        let newMedia = new Media({
          mediaType,
          externalId,
        });
        //save new media
        await newMedia.save();

        let newComment = new Comment({
          postedBy: userId,
          parentMediaId: newMedia._id,
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
};

module.exports = {
  createComment,
};

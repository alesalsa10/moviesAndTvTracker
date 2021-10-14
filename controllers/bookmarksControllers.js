const User = require('../models/User');
const Media = require('../models/Media');

//create a new bookmark;
//private route
//all routes will take this format /user/userId/media/...
const addBookmark = async (req, res) => {
  const { mediaType, externalId } = req.body;
  const { userId } = req.params;
  const loggedInUser = req.user;

  if (loggedInUser == userId) {
    //check if no media with given external id exists
    //if no media exists create a new one
    //then add it to the bookmakrs
    //if the media already exists, then just add its id to the bookmarks
    try {
      let foundUser = await User.findById(userId).select('-password');
      console.log(foundUser);
      if (foundUser) {
        try {
          //check if no media with given externalid exist
          let existingMedia = await Media.findOne({ externalId });
          //if media(movie to tv show) exists, add it to bookmarks array
          if (existingMedia) {
            //before adding a bookmark, check if one already exist
            let bookmarkExist = foundUser.bookmarks.includes(existingMedia._id);
            if (!bookmarkExist) {
              await foundUser.bookmarks.push(existingMedia);
              await foundUser.save();
              res.status(201).json({ Msg: 'Bookmark successfully created 1' });
            }else {
              res.status(409).json({Msg: 'Already exist'})
            }
          } else {
            let newMedia = new Media({
              mediaType,
              externalId,
            });

            //save new media
            await newMedia.save();

            //add bookmark to userfound
            await foundUser.bookmarks.push(newMedia);
            await foundUser.save();

            res.status(201).json({ Msg: 'Bookmark successbully created 2' });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({ Msg: 'Something went wrong' });
        }
      } else {
        res.status(404).json({ Msg: 'User not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ Msg: 'Something went wrong' });
    }
  } else {
    res.status(409).json({ Msg: 'Only account owner can add favorites' });
  }
};

module.exports = {
  addBookmark,
};

const User = require('../models/User');
const Media = require('../models/Media');
const externalGetMediaById = require('../externalAPI/apiCalls');
//need to change media to tv/movie

//create a new bookmark;
//private route
//all routes will take this format /user/userId/media/...
const addBookmark = async (req, res) => {
  const { externalId } = req.body;
  const userId = req.header('userId');
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
            res.status(201).json({ Msg: 'Bookmark successfully created' });
          } else {
            res.status(409).json({ Msg: 'Already exist' });
          }
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
};

const getAllBookmarks = async (req, res) => {
  //still needs to call movies api to get movie info inside
  //this will be done in a loop keeping count it will break onces it gets to the length of bookmarks length array
  const userId = req.header('userId');
  try {
    let user = await User.findById(userId)
      .select('bookmarks')
      .populate('bookmarks', '_id mediaType').lean();
    if (user) {
      for (const [i, bookmark] of user.bookmarks.entries()) {
        let mediaInfo = await externalGetMediaById(
          bookmark.mediaType,
          bookmark._id
        );
        user.bookmarks[i].mediaInfo = mediaInfo;
      }
      res.status(200).json({ user });
    } else {
      res.status(404).json({ Msg: 'This user does not exist' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const getAllBookmarkedByCategory = async (req, res) => {
  const userId = req.header('userId');
  const { mediaType } = req.params;
  try {
    let user = await User.findById(userId)
      .select('bookmarks')
      .populate({
        path: 'bookmarks',
        match: { mediaType: mediaType },
        select: '_id mediaType',
      }).lean();
    if (user) {
      for (const [i, bookmark] of user.bookmarks.entries()) {
        let mediaInfo = await externalGetMediaById(
          bookmark.mediaType,
          bookmark._id
        );
        user.bookmarks[i].mediaInfo = mediaInfo;
      }
      res.status(200).json(user);
    } else {
      res.status(404).json({ Msg: 'This user does not exist' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const deleteBookmark = async (req, res) => {
  const { bookmarkId } = req.params;
  const userId = req.header('userId');
  try {
    //when i delete the bookmark, i need to delete its reference in the parent user
    await User.updateOne(
      { _id: userId },
      { $pull: { bookmarks: { _id: bookmarkId } } },
      { multi: true }
    );
    res.status(200).json({ Msg: 'Bookmark deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};



module.exports = {
  addBookmark,
  getAllBookmarks,
  getAllBookmarkedByCategory,
  deleteBookmark,
};

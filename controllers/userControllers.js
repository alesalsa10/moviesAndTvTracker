const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const sendEmail = require('../services/sendEmail');

const uploadImage = require('../services/imageUpload');
const deletePicture = require('../services/imageDeletion')

const User = require('../models/User');

const getUser = async (req, res) => {
  const { id } = req.params;
  //check if user is different than the one on req.parms
  //display info depending on who it is
  console.log(req.user);
  let user;
  if (req.user == id) {
    console.log('can see all info');
    user = await User.findOne({ _id: id }).populate('bookmarks');
    // return 404 if no user found, return user otherwise.
    if (!user) {
      res.status(404).json({ Msg: 'User not found!' });
    } else {
      res.status(200).json(user);
    }
  } else if (req.user !== id) {
    console.log('only some info is shown');
    user = await User.findOne({ _id: id }).select('username favorites');
  }
};

const editUser = async (req, res) => {
  //only the username and name can be changed on the profile for now,  password will be able to be changed in later versions
  const { username, name } = req.body;
  const { id } = req.params;
  const user = req.user; //this is set on authentication middleware after decoding user
  //only a profile owner can edit the page
  if (id == user) {
    try {
      let fieldsToUpdate = { username, name };
      const userWithProposedUsername = await User.findOne({ username });

      //check that no user with this username already exists
      if (!userWithProposedUsername) {
        const user = await User.findByIdAndUpdate(req.user, fieldsToUpdate, {
          returnOriginal: false,
        });
        console.log(user);
        res.status(200).json({ Msg: 'User updated' });
      } else {
        res.status(409).json({ Msg: 'Username already exists' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ Msg: 'Something went wrong' });
    }
  } else {
    console.log('user unathorized');
    res
      .status(409)
      .json({ Msg: 'You are not authorized to change this profile' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  console.log(id, user);
  if (id == user) {
    try {
      await User.findByIdAndDelete(id);
      res.status(200).json({ Msg: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ Msg: 'Something went wrong' });
    }
  } else {
    res.status(409).json({ Msg: 'You are not authorized to delete this user' });
  }
};

const uploadProfileImage = async (req, res) => {
  const { userId } = req.params;
  //look up the user's profile pic first
  //if it is null, then do singleupload
  //else delete user's picture from s3, and add the new one
  try{
    let foundUser = await User.findById(userId);
    if(foundUser){
      let profilePicture = foundUser.profilePicture;
      if (!profilePicture) {
        //if it is not, then upload directly. it will be null on users with no picture
        const singleUpload = uploadImage('mediaprofilelogo').single('image');
        singleUpload(req, res, async function (err) {
          if (err) {
            return res.json({
              success: false,
              errors: {
                title: 'Image Upload Error',
                detail: err.message,
                error: err,
              },
            });
          }
          let update = { profilePicture: req.file.location };
          try {
            await User.findByIdAndUpdate(userId, update, { new: true });
            res.status(200).json('Successfull upload');
          } catch (error) {
            console.log(error);
            res
              .status(500)
              .json({ Msg: 'Something went wrong trying to find the user' });
          }
        });
      } else {
        //get users profilePicture link and get its link, which contains the s3 key as last part
        //delete the image from s3, and then run the same function as above
        let logoUrl = profilePicture.split('.com/');
        let s3Key = logoUrl[logoUrl.length - 1]; //get everything after logo .com
        console.log(s3Key);
        deletePicture(s3Key, function (err) {
          if (err) {
            res
              .status(500)
              .json({ Msg: 'Something went wrong removing the image' });
          } else {
            //res.status(200).json({Msg: 'Image deleted successfully'});
            singleUpload(req, res, async function (err) {
              if (err) {
                return res.json({
                  success: false,
                  errors: {
                    title: 'Image Upload Error',
                    detail: err.message,
                    error: err,
                  },
                });
              }
              let update = { profilePicture: req.file.location };
              try {
                await User.findByIdAndUpdate(userId, update, { new: true });
                res.status(200).json('Successfull changed profile picture');
              } catch (error) {
                console.log(error);
                res.status(500).json({
                  Msg: 'Something went wrong trying to find the user',
                });
              }
            });
          }
        });
      }
    }else{
      res.status(404).json({Msg: 'No user with this ID found'})
    }
  }catch(error){
    console.log(error);
    res.status(500).json({Msg: 'Something went wrong while trying to find user'})
  }
};

module.exports = {
  getUser,
  editUser,
  deleteUser,
  uploadProfileImage,
};

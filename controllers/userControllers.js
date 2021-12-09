const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
  secretAccessKey: process.env.AWSSecretKey,
  accessKeyId: process.env.AWSAccessKeyId,
  region: 'us-east-1',
});

var s3 = new aws.S3();
  
const User = require('../models/User');

const register = async (req, res) => {
  const { email, password, username, name } = req.body;

  try {
    //check user by username and by email
    let userByEmail = await User.findOne({ email });
    let userByUsername = await User.findOne({ username });

    if (userByEmail || userByUsername) {
      //if a user is found already return error
      return res.status(409).json({ Error: 'User already exists' });
    } else {
      const salt = await bcrypt.genSalt(10);
      // hash the password along with our new salt
      const encryptedPassword = await bcrypt.hash(password, salt);

      //create user
      let user = new User({
        email,
        password: encryptedPassword,
        username,
        name,
      });

      await user.save();
      res.status(203).json({ user });
      console.log(user);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: 'Oops, something went wrong' });
  }
};

const signIn = async (req, res) => {
  const { username, password, email } = req.body;
  //check if user exists
  //if no user exist send error invalid crednetial error
  //if user users exist, compared hashed password, if it mataches create jwt token to send back to client
  try {
    let foundUserByUsername = await User.findOne({ username });
    let foundUserByEmail = await User.findOne({ email });

    if (foundUserByUsername || foundUserByEmail) {
      //if user is found with given email or username, compare password with hashed password
      let match;
      if (foundUserByEmail) {
        console.log(foundUserByEmail);
        match = await bcrypt.compare(password, foundUserByEmail.password);
      } else {
        match = await bcrypt.compare(password, foundUserByUsername.password);
      }
      let user = foundUserByEmail || foundUserByUsername;
      if (match) {
        var token = jwt.sign({ user: user._id }, process.env.jwtKey);
        res.status(201).json(token);
      } else {
        res.status(401).json({ Msg: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ Msg: 'Incorrect credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: 'Something went wrong' });
  }
};

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    let foundUser = await User.findOne({ email });
    if (foundUser) {
      //before sending the email I have to create a token which gets attached to the resetPasswordToken
      // sendEmail(email, foundUser._id, 4555);
      // res.status(200).json({Msg: 'Check your email'})
      let resetToken = Math.floor(100000 + Math.random() * 900000);
      let emailResponse = await sendEmail(email, foundUser._id, resetToken);
      console.log(emailResponse);

      if (!emailResponse.error) {
        let expiry = Date.now() + 60 * 1000 * 15; //15 minutes
        foundUser.resetPasswordToken = resetToken;
        foundUser.resetPasswordTokenExpiration = expiry;

        await foundUser.save();

        res.status(200).json({
          Msg: 'If the email is found, you should receive a link to reset your password shortly',
        });
      } else {
        res.status(500).json({ Msg: 'Could not sent email. Try again later' });
      }
    } else {
      res.status(404).json({ Msg: 'No user with that given address' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const resetPassword = async (req, res) => {
  const { userId, token } = req.params;
  const { password } = req.body;

  //find the user by id and token
  //check that token has not expired
  //get user password
  //hash it
  //set token and expiration back to null
  //save the user

  const foundUser = await User.findOne({
    _id: userId,
    resetPasswordToken: token,
    resetPasswordTokenExpiration: { $gt: Date.now() },
  });

  if (!foundUser) {
    res.send(401).json({ Msg: 'Password reset token invalid or has expired' });
  } else {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    foundUser.password = encryptedPassword;
    foundUser.resetPasswordToken = null;
    foundUser.resetPasswordTokenExpiration = null;
    await foundUser.save();

    res.status(201).json({ Msg: 'Password has been changed' });
  }
};

const uploadProfileImage = async (req, res) => {
  const { userId } = req.params;

};

module.exports = {
  register,
  signIn,
  getUser,
  editUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  uploadProfileImage,
};

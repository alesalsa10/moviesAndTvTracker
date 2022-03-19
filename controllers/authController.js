const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const sendEmail = require('../services/sendEmail');
const crypto = require('crypto');

const User = require('../models/User');
const EmailToken = require('../models/EmailToken');
const PasswordToken = require('../models/PasswordToken');
const { findByIdAndUpdate } = require('../models/User');

const register = async (req, res) => {
  const { email, password, username, name } = req.body;

  try {
    //check user by username and by email
    let userByEmail = await User.findOne({ email });
    let userByUsername = await User.findOne({ username });

    if (userByEmail && userByUsername) {
      return res
        .status(409)
        .json({ Error: 'Username and email already in use' });
    } else if (userByEmail) {
      return res.status(409).json({ Error: 'Email already in use' });
    } else if (userByUsername) {
      return res.status(409).json({ Error: 'Username already in use' });
    } else {
      const salt = await bcrypt.genSalt(10);
      // hash the password along with our new salt
      const encryptedPassword = await bcrypt.hash(password, salt);
      const cryptoToken = crypto.randomBytes(16).toString('hex');

      //create user
      let user = new User({
        email,
        password: encryptedPassword,
        username,
        name,
      });
      await user.save();
      const newToken = new EmailToken({
        user: user._id,
        token: cryptoToken,
      });
      await newToken.save();
      try {
        await sendEmail(email, cryptoToken, 'verify');

        console.log(user);
        const token = jwt.sign({ user: user._id }, process.env.jwtKey);
        return res.status(200).json({
          token,
          msg: 'A verification email has been sent. It will expire after one hour.',
        });
      } catch (e) {
        console.log(e);
        res.status(500).json({ Msg: 'Error sending verification email' });
      }
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
        const token = jwt.sign({ user: user._id }, process.env.jwtKey);
        res.status(201).json(token);
      } else {
        res.status(401).json({ Msg: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ Msg: 'Invalid username or password' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: 'Something went wrong' });
  }
};

const verifyEmail = async (req, res) => {
  const paramToken = req.params.token;
  const token = await EmailToken.findOne({
    token: paramToken,
  });
  //check if token is not found(will be romoved with a cron job in the future)
  //if it is found, check that it has not expired
  if (!token) {
    return res
      .status(404)
      .json({ Msg: 'Token not found, it might  have expired' });
  } else {
    let currentDate = new Date(Date.now());
    if (token.expiresAt < currentDate) {
      return res.status(401).json({ Msg: 'Token has expired' });
    } else {
      try {
        //find user where token is equal to the sent token,
        //change user isVerified to true
        //delete token
        const user = await User.findOne({
          _id: token.user,
        });
        if (!user) {
          return res.status(401).send({
            Msg: 'We were unable to find a user for this verification.',
          });
        } else if (user.isVerified) {
          return res
            .status(200)
            .send('User has been already verified. Please Login');
        } else {
          //delete the token from the database since I don't have con job yet
          await EmailToken.findByIdAndDelete(token._id);

          //verify account
          await findByIdAndUpdate(token.user, { isVerified: true });
          await EmailToken.findByIdAndDelete(token._id);
          res
            .status(200)
            .json({ Msg: 'Your account has been successfully verified' });
        }
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .json({ Msg: 'Could not verify token, try again later' });
      }
    }
  }
};

const resendVerificationEmail = async (req, res) => {
  //send email to link in the front end
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      Msg: 'We were unable to find a user with that email. Make sure your Email is correct!',
    });
  } else if (user.isVerified) {
    return res
      .status(200)
      .send('This account has been already verified. Please log in.');
  } else {
    //check if user already has a token attached to it, and remove it
    const token = await EmailToken.findOne({
      user: user._id,
    });
    const cryptoToken = crypto.randomBytes(16).toString('hex');

    if (token) {
      //delete token
      await EmailToken.findByIdAndDelete(token._id);
    }
    const newToken = new EmailToken({
      user: user._id,
      token: cryptoToken,
    });
    await newToken.save();
    try {
      await sendEmail(email, cryptoToken, 'verify');
      return res.status(200).json({
        msg: 'A verification email has been sent. It will expire after one hour.',
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ Msg: 'Error sending verification email' });
    }
  }
};

const forgotPassword = async (req, res) => {
  //send the email with link to frontend page which will make a get
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(200)
      .json({
        Msg: 'If your acccount exists, you will receive an email with instructions shortly',
      });
  } else {
    const passwordToken = await PasswordToken.findOne({
      user: user._id,
    });
    const cryptoToken = crypto.randomBytes(16).toString('hex');

    if (passwordToken) {
      //delete token
      await PasswordToken.findByIdAndDelete(passwordToken._id);
    }
    const newToken = new PasswordToken({
      user: user._id,
      token: cryptoToken,
    });
    await newToken.save();
    try {
      await sendEmail(email, cryptoToken, 'reset');
      return res.status(200).json({
        Msg: 'If your acccount exists, you will receive an email with instructions shortly',
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ Msg: 'Error sending verification email' });
    }
  }
};

const resetPassword = async (req, res) => {
  //this is the link of the
  const paramToken = req.params.token;
  const newPassword = req.body.password;
  const token = await PasswordToken.findOne({
    token: paramToken,
  });

  if (!token) {
    return res
      .status(404)
      .json({ Msg: 'Token not found, it might  have expired' });
  } else {
    let currentDate = new Date(Date.now());
    if (token.expiresAt < currentDate) {
      return res.status(401).json({ Msg: 'Token has expired' });
    } else {
      const user = await User.findById(token.user);
      if (!user) {
        return res.status(401).send({
          Msg: 'We were unable to find a user for this verification.',
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(newPassword, salt);
        const updatedUser = await User.findByIdAndUpdate(token.user, {
          password: encryptedPassword,
        });
        await PasswordToken.findByIdAndDelete(token._id);
        return res.status(200).json({ Msg: 'Password changed successfully' });
      }
    }
  }
};

const changePassword = async (req, res) => {
  //this is for the user is already logged in
  //previous password check, then new
  const { currentPassword, newPassword } = req.body;
  try {
    let foundUser = await User.findById(req.user);
    if (foundUser) {
        let match = await bcrypt.compare(currentPassword, foundUser.password);
        if(match){
          const salt = await bcrypt.genSalt(10);
          const encryptedPassword = await bcrypt.hash(newPassword, salt);
          const updatedUser = await User.findByIdAndUpdate(token.user, {
            password: encryptedPassword,
          });
          return res.status(200).json({Msg: 'Password updated successfully'})
        }else {
          return res.status(401).json({Msg: 'Invalid current password'})
        }
    } else {
      return res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {}
};

const signInWithGoogle = async (req, res) => {
  //placeholder, will add this once I have a demo frontend
};

module.exports = {
  register,
  signIn,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};

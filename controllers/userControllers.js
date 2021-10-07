const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const User = require('../models/User');

const register = async (req, res) => {
  const { email, password, username } = req.body;

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
      });

      await user.save();
      res.status(200).json({ user });
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
        res.status(400).json(token);
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

module.exports = {
  register,
  signIn,
};

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

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

const getAnUser = async (req, res) => {
  const { id } = req.params;

  //check if user is different than the one on req.parms
  //display info depending on who it is
  console.log(req.user);
  let user;

  if (req.user == id) {
    console.log('can see all info');
    user = await User.findOne({ _id: id });
  } else if (req.user !== id) {
    console.log('only some info is shown');
    user = await User.findOne({ _id: id }).select('username favorites');
  }

  // return 404 if no user found, return user otherwise.
  if (!user) {
    res.status(404).json({ Msg: 'User not found!' });
  } else {
    res.status(302).json(user);
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
        res.status(409).json({Msg: 'Username already exists'})
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

module.exports = {
  register,
  signIn,
  getAnUser,
  editUser,
};

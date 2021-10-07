const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  userName: {
    type: String,
    required: true,
    default: defaultUserName(this.email),
  },
  favorites:[
    {
    //this will be the id from the external api
    type: String,   
  }
]
});

const defaultUserName = (email) => {
  //default username if none is given will be whatever it is before @ in the email provided by the user
  return email.split('@')[0];
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

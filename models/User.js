const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
  username: {
    type: String,
    required: true,
    unique: true,
  },
  favorites:[
    {
    //this will be the id from the external api
    type: String,   
  }
]
});


const User = mongoose.model('User', UserSchema);

module.exports = User;

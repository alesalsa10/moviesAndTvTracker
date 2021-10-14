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
  bookmarks:[
    {
    //this will be the id from the external api
    type: mongoose.Types.ObjectId,
    ref: "Media" ,
    unique: true
  },
],
name:{
  type: String,
  required: true,
  minlength: 4
}
});


const User = mongoose.model('User', UserSchema);

module.exports = User;

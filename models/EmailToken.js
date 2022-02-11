const mongoose = require('mongoose');
const moment = require('moment');

const hourFromNow = function () {
  return moment().add(1, 'hour');
};


const EmailTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  token:{
      type: Number,
      required: true,
      unique: true
  },
  expiresAt:{
      type: Date,
      default: hourFromNow
  }
});


const EmailToken = mongoose.model('EmailToken', EmailTokenSchema);

module.exports = EmailToken;
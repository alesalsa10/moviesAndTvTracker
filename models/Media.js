const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    required: true,
  },
  // externalId: {
  //   type: String,
  //   required: true,
  //   unique: true
  // },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  _id: Number,
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;

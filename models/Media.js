const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    required: true,
  },
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

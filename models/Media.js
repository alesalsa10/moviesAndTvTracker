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
  seasons: [
    {
      type: String, //this is the id for the season which is the same as the season id from the external api
      ref: 'Season',
    },
  ],
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;

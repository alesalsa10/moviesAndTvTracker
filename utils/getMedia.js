const Movie = require('../models/Movie');
const Tv = require('../models/Tv');
const Season = require('../models/Season');
const Episode = require('../models/Episode');

//still need to customze errors, these should not return a status themselves, just the error json, status is going to be sent by whicher ever controller is using it
const getMedia = async (
  externalId,
  mediaType,
  update = false,
  commentId = undefined,
) => {
  let existingMedia;
  if (mediaType == 'tv') {
    try {
      existingMedia = await Tv.findById(externalId);
      //return existingMedia;
      if (!update && !commentId) {
        return existingMedia;
      } else {
        try {
          await Tv.findByIdAndUpdate(
            { _id: externalId },
            {
              $pull: {
                comments: commentId,
              },
            }
          );
          return existingMedia;
        } catch (err) {
          console.log(err);
          existingMedia = undefined;
          return existingMedia;
        }
      }
    } catch (err) {
      console.log(err);
      existingMedia = undefined;
      return existingMedia;
    }
  } else if (mediaType == 'movie') {
    try {
      existingMedia = await Movie.findById(externalId);
      if (!update && !commentId) {
        return existingMedia;
      } else {
        try {
          await Movie.findByIdAndUpdate(
            { _id: externalId },
            {
              $pull: {
                comments: commentId,
              },
            }
          );
          return existingMedia;
        } catch (err) {
          console.log(err);
          existingMedia = undefined;
          return existingMedia;
        }
      }
    } catch (err) {
      console.log(err);
      existingMedia = undefined;
      return existingMedia;
    }
  } else if (mediaType == 'season') {
    try {
      existingMedia = await Season.findById(externalId);
      // existingMedia = undefined;
      // return existingMedia;
      if (!update && !commentId) {
        return existingMedia;
      } else {
        try {
          await Season.findByIdAndUpdate(
            { _id: externalId },
            {
              $pull: {
                comments: commentId,
              },
            }
          );
          return existingMedia;
        } catch (err) {
          console.log(err);
          existingMedia = undefined;
          return existingMedia;
        }
      }
    } catch (err) {
      console.log(err);
      existingMedia = undefined;
      return existingMedia;
    }
  } else {
    try {
      existingMedia = await Episode.findById(externalId);
      // return existingMedia;
      if (!update && !commentId) {
        return existingMedia;
      } else {
        try {
          await Episode.findByIdAndUpdate(
            { _id: externalId },
            {
              $pull: {
                comments: commentId,
              },
            }
          );
          return existingMedia;
        } catch (err) {
          console.log(err);
          existingMedia = undefined;
          return existingMedia;
        }
      }
    } catch (err) {
      console.log(err);
      existingMedia = undefined;
      return existingMedia;
    }
  }
};

module.exports = getMedia;

//only need to get the media as creating will only happen when the user tries to interact with it
//it is created with the api key when the user goes to click on given media from the movie database api

const Media = require('../models/Media');
const axios = require('axios').default;

const getMediaById = async (req, res) => {
  //lookup media by id
  //if media is found
  //call external api, get response
  //merge response with my own database
  const { mediaType, id } = req.params;
  try {
    let foundMedia = await Media.findById(id)
      .populate('comments')
      .populate({
        path: 'comments',
        populate: {
          path: 'replies',
        },
      });
    if (foundMedia) {
      console.log(foundMedia);
      //res.status(200).json(foundMedia);
      try {
        let mediaDetails = await externalGetMediaById(mediaType, id);
        console.log(foundMedia);
        res.status(200).json({ mediaDetails, foundMedia });
      } catch (err) {
        console.log(err);
        res.status(mediaDetails.status).json({ Msg: mediaDetails.Msg });
      }
    } else {
      //res.status(404).json({ Msg: 'Media not found' });
      //if media by given by api id is not found create one
      let newMedia = new Media({
        mediaType,
        _id: id,
      });
      //save new media
      await newMedia.save();
      try {
        let mediaDetails = await externalGetMediaById(mediaType, id);
        console.log(mediaDetails);
        res.status(200).json({ mediaDetails, foundMedia });
      } catch (err) {
        console.log(err);
        res.status(mediaDetails.status).json({ Msg: mediaDetails.Msg });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const getMediaByCategories = async (req, res) => {
  const { mediaType, category } = req.params;
  try {
    const response = await axios.get(
      `${process.env.baseURL}/${mediaType}/${category}?api_key=${process.env.apiKey}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (err) {
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const searchMedia = async (req, res) => {
  //   https://api.themoviedb.org/3/search/multi?api_key=f2e1db77c8ae74a5c21ae7b7d5630dfb&language=en-US&query=avengers&page=1&include_adult=false

  const { searchQuery } = req.params;
  console.log(req.params);
  try {
    const response = await axios.get(
      `${process.env.baseURL}/search/multi?api_key=${process.env.apiKey}&query=${searchQuery}&include_adult=false`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (err) {
    console.log(searchQuery);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const externalGetMediaById = async (mediaType, id) => {
  try {
    const response = await axios.get(
      `${process.env.baseURL}/${mediaType}/${id}?api_key=${process.env.apiKey}`
    );
    return response.data;
  } catch (err) {
    console.log(err);
    return {
      status: err.response.staus,
      Msg: err.response.data.status_message,
    };
  }
};

module.exports = {
  getMediaById,
  getMediaByCategories,
  searchMedia,
};

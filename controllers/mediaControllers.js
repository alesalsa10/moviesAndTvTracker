//only need to get the media as creating will only happen when the user tries to interact with it
//it is created with the api key when the user goes to click on given media from the movie database api

const Media = require('../models/Media');
const externalGetMediaById = require('../externalAPI/apiCalls');
const { default: axios } = require('axios');

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
      let mediaDetails = await externalGetMediaById(mediaType, id);
      console.log('24', mediaDetails);
      if (mediaDetails.error) {
        res
          .status(mediaDetails.error.status)
          .json({ Msg: mediaDetails.error.Msg });
      } else {
        res.status(200).json({ mediaDetails, foundMedia });
      }
    } else {
      let mediaDetails = await externalGetMediaById(mediaType, id);
      console.log('35', mediaDetails);
      if (mediaDetails.error) {
        res
          .status(mediaDetails.error.status)
          .json({ Msg: mediaDetails.error.Msg });
      } else {
        let foundMedia = new Media({
          mediaType,
          _id: id,
        });
        await foundMedia.save();
        res.status(200).json({ mediaDetails, foundMedia });
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

const getMediaLists = async (req, res) => {
  const { mediaType, listType } = req.params;
  try {
    const response = await axios.get(
      `${process.env.baseURL}/${mediaType}/${listType}?api_key=${process.env.apiKey}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getRecommendations = async (req, res) => {
  const { mediaType, id } = req.params;
  try {
    const response = await axios.get(
      `${process.env.baseURL}/${mediaType}/${id}/recommendations?api_key=${process.env.apiKey}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getVideos = async (req, res) => {
  const { mediaType, id } = req.params;
  try {
    const response = await axios.get(
      `${process.env.baseURL}/${mediaType}/${id}/videos?api_key=${process.env.apiKey}`
    );
    console.log(response);
    let trailerVideos = [];
    for (const video of response.data.results) {
      if (video.type == 'Trailer') {
        trailerVideos.push(video);
      }
    }
    res.status(200).json(trailerVideos);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getSeason = async (req, res) => {
  const { id, seasonNumber } = req.params;
  try {
    const response = await axios.get(
      `${process.env.baseURL}/tv/${id}/season/${seasonNumber}?api_key=${process.env.apiKey}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getEpisode = async (req, res) => {
  const { id, seasonNumber, episodeNumber } = req.params;
  try {
    const response = await axios.get(
      `${process.env.baseURL}/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${process.env.apiKey}&append_to_response=videos`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

module.exports = {
  getMediaById,
  getMediaByCategories,
  searchMedia,
  getMediaLists,
  getRecommendations,
  getVideos,
  getSeason,
  getEpisode,
};

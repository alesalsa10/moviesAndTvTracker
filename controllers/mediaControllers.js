//only need to get the media as creating will only happen when the user tries to interact with it
//it is created with the api key when the user goes to click on given media from the movie database api
const Season = require('../models/Season');
const Episode = require('../models/Episode');
//const Movie = require('../models/Movie');
const Tv = require('../models/Tv');
const apiCalls = require('../externalAPI/apiCalls');
const { default: axios } = require('axios');
const BasedOnBook = require('../models/BasedOnBook');
const Selector = require('../utils/selector');

const getMediaById = async (req, res) => {
  //lookup media by id
  //if media is found
  //call external api, get response
  //merge response with my own database,
  const { mediaType, id } = req.params;
  let foundMedia;
  const selector = new Selector();
  let model = selector.chooseModel(mediaType);
  if (!model) {
    return res.status(500).json({ Msg: 'No media by this name' });
  }
  try {
    foundMedia = await model
      .findById(id)
      //.lean();
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
  if (foundMedia) {
    let mediaDetails = await apiCalls.externalGetMediaById(mediaType, id);
    console.log(mediaDetails, '1111111');
    if (mediaDetails.error) {
      res
        .status(mediaDetails.error.status)
        .json({ Msg: mediaDetails.error.Msg });
    } else {
      res.status(200).json({ mediaDetails, foundMedia });
    }
  } else {
    let mediaDetails = await apiCalls.externalGetMediaById(mediaType, id);
    console.log(mediaDetails, '1111111');
    if (mediaDetails.error) {
      res
        .status(mediaDetails.error.status)
        .json({ Msg: mediaDetails.error.Msg });
    } else {
      let foundMedia;
      foundMedia = new model({
        _id: id, //mediaDetails.id
      });
      await foundMedia.save();
      res.status(200).json({ mediaDetails, foundMedia });
    }
  }
};

const getMediaByCategories = async (req, res) => {
  const { mediaType, category } = req.params;
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/${mediaType}/${category}?api_key=${process.env.TMDB_KEY}`
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
  //from the front end a search will call this, and search book in the bookController
  //this allows for better error handling
  //const { searchQuery } = req.params;
  let search_query = req.query.search_query.split(' ').join('+');
  console.log(search_query);
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/search/multi?api_key=${process.env.TMDB_KEY}&query=${search_query}&include_adult=false`
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getTrending = async (req, res) => {
  const { mediaType, timePeriod } = req.params;
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/trending/${mediaType}/${timePeriod}?api_key=${process.env.TMDB_KEY}`
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getMediaLists = async (req, res) => {
  const { mediaType, listType } = req.params;
  let page = req.query.page;
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/${mediaType}/${listType}?api_key=${process.env.TMDB_KEY}&page=${page}`
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
      `${process.env.TMDB_BASE_URL}/${mediaType}/${id}/recommendations?api_key=${process.env.TMDB_KEY}`
    );
    console.log(response);
    let mediaDetails = await apiCalls.externalGetMediaById(mediaType, id);
    if (mediaDetails.error) {
      res
        .status(mediaDetails.error.status)
        .json({ Msg: mediaDetails.error.Msg });
    } else {
      let release_year = new Date(mediaDetails.release_date).getFullYear();
      console.log(release_year);
      let basedBook;
      try {
        basedBook = await BasedOnBook.findOne({
          media_name: mediaDetails.title,
          release_year: release_year,
        }).lean();
        if (basedBook) {
          //call google api
          //if success, save book with volume id as id
          let author_last_name = basedBook.book_author.split(',')[0];
          console.log(basedBook.book_name.split(' ').join('+'));
          const books = await axios.get(
            `${process.env.googleBookURL}intitle:${basedBook.book_name
              .split(' ')
              .join('+')}+inauthor:${author_last_name}&maxResults=1&key=${
              process.env.googleBooksKey
            }`
          );
          if (books.data.totalItems > 0) {
            //res.status(200).json({...response.data, ...books.data.items[0]});
            //call google books api
            res.status(200).json({ ...response.data, ...books.data.items[0] });
          } else {
            let books = { books: null };
            res.status(200).json({ ...response.data, books });
          }
        } else {
          res.status(200).json(response.data);
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ Msg: 'Something went wrong' });
      }
      //res.status(200).json(response.data);
    }
    //res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getSeason = async (req, res) => {
  //when an user get a season
  //check if season exists in array called seasons inside the media document
  //if it does not create a new season with the seasonNumber and the id from the external api
  //this is done to be able to track comments
  //return the season information with merged with the founded season created on my DB
  //use lean() to be able to merge objects
  const { id, seasonNumber } = req.params;
  console.log(id, seasonNumber);
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,credits,release_dates`
    );
    console.log(response, 'aaaa');
    let mediaDetails = response.data
    try {
      let foundMedia = await Tv.findById(id);
      if (foundMedia) {
        try {
          let foundSeason = await Season.findOne({ seasonNumber })
            .populate('comments')
            .populate({
              path: 'comments',
              populate: {
                path: 'replies',
              },
            })
            .lean();
          if (foundSeason) {
            //mediaDetails
            res.status(200).json({ mediaDetails, foundSeason });
          } else {
            let foundSeason = new Season({
              seasonNumber,
              _id: mediaDetails.id,
              media: foundMedia._id,
            });
            await foundSeason.save();
            await foundMedia.seasons.push(foundSeason);
            await foundMedia.save();
            res.status(200).json({ mediaDetails, foundSeason });
          }
        } catch (err) {
          console.log(err);
          res.status(500).json({ Msg: 'Something went wrong' });
        }
      } else {
        let foundMedia = new Tv({
          _id: id,
        });
        await foundMedia.save();
        let foundSeason = new Season({
          seasonNumber,
          _id: mediaDetails.id,
          media: foundMedia._id,
        });
        await foundSeason.save();
        await foundMedia.seasons.push(foundSeason);
        await foundMedia.save();
        res.status(200).json({ ...response.data, foundSeason });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ Msg: 'Something went wrong' });
    }
  } catch (err) {
    console.log(err, 'rtret');
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const getEpisode = async (req, res) => {
  const { id, seasonNumber, episodeNumber } = req.params;
  try {
    const episode = await axios.get(
      `${process.env.TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,credits,release_dates`
    );
    console.log(episode);
    let mediaDetails = episode.data
    //res.status(200).json(response.data);
    try {
      const season = await axios.get(
        `${process.env.TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,credits,release_dates`
      );
      console.log(season);
      try {
        let foundMedia = await Tv.findById(id);
        if (foundMedia) {
          try {
            let foundSeason = await Season.findOne({ seasonNumber });
            if (foundSeason) {
              //res.status(200).json({ ...season.data, foundSeason });
              try {
                let foundEpisode = await Episode.findOne({ episodeNumber })
                  .populate('comments')
                  .populate({
                    path: 'comments',
                    populate: {
                      path: 'replies',
                    },
                  })
                  .lean();
                if (foundEpisode) {
                  //let mediaDetails = episode.data
                  res.status(200).json({ mediaDetails, foundEpisode });
                } else {
                  let foundEpisode = new Episode({
                    _id: mediaDetails.id,
                    season: foundSeason._id,
                    episodeNumber: episodeNumber,
                  });
                  await foundEpisode.save();
                  await foundSeason.episodes.push(foundEpisode);
                  await foundSeason.save();
                  res.status(200).json({ mediaDetails, foundEpisode });
                }
              } catch (err) {
                console.log(err);
                res.status(500).json({ Msg: 'Something went wrong' });
              }
            } else {
              let foundSeason = new Season({
                seasonNumber,
                _id: season.data._id,
                media: foundMedia._id,
              });
              await foundSeason.save();
              await foundMedia.seasons.push(foundSeason);
              await foundMedia.save();
              //res.status(200).json({ ...season.data, foundSeason });
              //search for episode
              let foundEpisode = new Episode({
                _id: mediaDetails.id,
                season: foundSeason._id,
                episodeNumber: episodeNumber,
              });
              await foundEpisode.save();
              await foundSeason.episodes.push(foundEpisode);
              await foundSeason.save();
              res.status(200).json({ mediaDetails, foundEpisode });
            }
          } catch (err) {
            console.log(err);
            res.status(500).json({ Msg: 'Something went wrong' });
          }
        } else {
          let foundMedia = new Tv({
            _id: id,
          });
          await foundMedia.save();
          let foundSeason = new Season({
            seasonNumber,
            _id: season.data._id,
            media: foundMedia._id,
          });
          await foundSeason.save();
          await foundMedia.seasons.push(foundSeason);
          await foundMedia.save();
          let foundEpisode = new Episode({
            _id: mediaDetails.id,
            season: foundSeason._id,
            episodeNumber: episodeNumber,
          });
          await foundEpisode.save();
          await foundSeason.episodes.push(foundEpisode);
          await foundSeason.save();
          res.status(200).json({ mediaDetails, foundEpisode });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ Msg: 'Something went wrong' });
      }
    } catch (err) {
      console.log(err);
      res
        .status(err.response.status)
        .json({ Msg: err.response.data.status_message });
    }
  } catch (err) {
    console.log(err);
    res
      .status(err.response.status)
      .json({ Msg: err.response.data.status_message });
  }
};

const filterByGenre = async (req, res) => {
  const { mediaType } = req.params;
  let with_genres = req.query.with_genres;
  console.log(mediaType, req.query);
  //with_genres comma separated
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/discover/${mediaType}?api_key=${process.env.TMDB_KEY}&with_genres=${with_genres}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong, try again later' });
  }
};

module.exports = {
  getMediaById,
  getMediaByCategories,
  searchMedia,
  getMediaLists,
  getRecommendations,
  getSeason,
  getEpisode,
  getTrending,
  filterByGenre,
};

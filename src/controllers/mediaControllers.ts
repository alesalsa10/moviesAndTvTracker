//only need to get the media as creating will only happen when the user tries to interact with it
//it is created with the api key when the user goes to click on given media from the movie database api
import Season from '../models/Season';
import Episode from '../models/Episode';
import Movie from '../models/Movie';
import Tv from '../models/Tv';
import apiCalls from '../externalAPI/apiCalls';
import { default as axios } from 'axios';
import BasedOnBook from '../models/BasedOnBook';
import Selector from '../utils/selector';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

const getMediaById = async (req: Request, res: Response) => {
  //lookup media by id
  //if media is found
  //call external api, get response
  //merge response with my own database,
  //const { mediaType, id } = req.params;
  const mediaType: string = req.params.mediaType;
  const id: string = req.params.id;
  let foundMedia: any;
  const selector = new Selector();
  let model: any = selector.chooseModel(mediaType);
  if (!model) {
    return res.status(500).json({ Msg: 'No media by this name' });
  }
  try {
    foundMedia = await model.findOne({ externalId: id });
    //.lean();
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
  if (foundMedia) {
    let mediaDetails = await apiCalls.externalGetMediaById(mediaType, id);
    if (mediaDetails.error) {
      res
        .status(mediaDetails.error.status)
        .json({ Msg: mediaDetails.error.Msg });
    } else {
      res.status(200).json({ mediaDetails, foundMedia });
    }
  } else {
    let mediaDetails = await apiCalls.externalGetMediaById(mediaType, id);
    if (mediaDetails.error) {
      res
        .status(mediaDetails.error.status)
        .json({ Msg: mediaDetails.error.Msg });
    } else {
      //let foundMedia;
      //movie = title; tv = name
      let name = mediaType === 'movie' ? mediaDetails.title : mediaDetails.name;
      foundMedia = new model({
        externalId: id, //mediaDetails.id
        name: name,
      });
      await foundMedia.save();
      res.status(200).json({ mediaDetails, foundMedia });
    }
  }
};

const getMediaByCategories = async (req: Request, res: Response) => {
  //const { mediaType, category } = req.params;
  const mediaType: string = req.params.mediaType;
  const category: string = req.params.category;
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

const searchMedia = async (req: Request, res: Response) => {
  //from the front end a search will call this, and search book in the bookController
  //this allows for better error handling
  //const { searchQuery } = req.params;
  let search_query: string = (req.query.search_query as string)
    .split(' ')
    .join('+');
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

const getTrending = async (req: Request, res: Response) => {
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

const getMediaLists = async (req: Request, res: Response) => {
  const { mediaType, listType } = req.params;
  let page: string = req.query.page as string;
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

const getRecommendations = async (req: Request, res: Response) => {
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

const getSeason = async (req: Request, res: Response) => {
  const { id, seasonNumber } = req.params;
  let season = await apiCalls.getSeasonInfo(seasonNumber, id);
  if (season.error) {
    return res.status(season.error.status).json({ Msg: season.error.Msg });
  } else {
    //if season exists, then tv show exists
    let parentTv = await apiCalls.externalGetMediaById('tv', id);
    if (parentTv.error) {
      return res
        .status(parentTv.error.status)
        .json({ Msg: parentTv.error.Msg });
    } else {
      try {
        let media = await Tv.findOneAndUpdate(
          { externalId: id },
          { name: parentTv.name },
          { new: true, upsert: true }
        );
        let foundSeason = await Season.findOneAndUpdate(
          {
            externalId: season.id,
            seasonNumber: seasonNumber,
          },
          {
            seasonNumber: seasonNumber,
            externalId: season.id,
            media: id,
            name: season.name,
            mediaName: media.name,
          },
          { new: true, upsert: true }
        );

        await Tv.findByIdAndUpdate(media._id, {
          $addToSet: { seasons: foundSeason._id },
        });
        let mediaDetails = season;
        let foundMedia = foundSeason;
        return res.status(200).json({ mediaDetails, foundMedia });
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .json({ Msg: 'Something went wrong. Try again later' });
      }
    }
  }
};

const getEpisode = async (req: Request, res: Response) => {
  const { id, seasonNumber, episodeNumber } = req.params;
  let episode = await apiCalls.getEpisodeInfo(seasonNumber, episodeNumber, id);
  if (episode.error) {
    return res.status(episode.error.status).json({ Msg: episode.error.Msg });
  } else {
    //if episide exists then season and tv show exist as well
    let season = await apiCalls.getSeasonInfo(seasonNumber, id);
    if (season.error) {
      return res.status(season.error.status).json({ Msg: season.error.Msg });
    } else {
      let parentTv = await apiCalls.externalGetMediaById('tv', id);
      if (parentTv.error) {
        return res
          .status(parentTv.error.status)
          .json({ Msg: parentTv.error.Msg });
      } else {
        try {
          let media = await Tv.findOneAndUpdate(
            { externalId: id },
            { externalId: id, name: parentTv.name },
            { new: true, upsert: true }
          );

          let foundSeason = await Season.findOneAndUpdate(
            {
              externalId: season.id,
              seasonNumber: seasonNumber,
            },
            {
              seasonNumber: seasonNumber,
              externalId: season.id,
              media: id,
              name: season.name,
              mediaName: media.name,
            },
            { new: true, upsert: true }
          );
          await Tv.findByIdAndUpdate(media._id, {
            $addToSet: { seasons: foundSeason._id },
          });

          let foundEpisode = await Episode.findOneAndUpdate(
            { externalId: episode.id, episodeNumber: episodeNumber },
            {
              externalId: episode.id,
              season: foundSeason._id,
              episodeNumber: episodeNumber,
              name: episode.name,
              mediaName: media.name,
              mediaId: media._id,
              seasonNumber: foundSeason.seasonNumber,
            },
            { new: true, upsert: true }
          );
          await Season.findByIdAndUpdate(foundSeason._id, {
            $addToSet: { episodes: foundEpisode._id },
          });
          let mediaDetails = episode;
          let foundMedia = foundEpisode;
          return res.status(200).json({ mediaDetails, foundMedia });
        } catch (error) {
          console.log(error);
          return res
            .status(500)
            .json({ Msg: 'Something went wrong, try again later' });
        }
      }
    }
  }
};



const filterByGenre = async (req: Request, res: Response) => {
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

const isMediaBasedOnBook = async (req: Request, res: Response) => {
  const { media_name, release_year } = req.body;
  console.log(media_name, release_year);
  try {
    let basedBook = await BasedOnBook.findOne({
      media_name: media_name,
      release_year: new Date(release_year).getFullYear(),
    }).lean();
    console.log(basedBook);

    if (basedBook) {
      let book = await apiCalls.searchByTitleAndAuthor(
        basedBook.book_name,
        basedBook.book_author
      );
      if (book.error) {
        res.status(book.error.status).json({ Msg: book.error.Msg });
      } else {
        console.log(book);
        return res.status(200).json(book.items[0]);
      }
    } else {
      return res.status(404).json({ Msg: 'No book found' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const getMoviesBasedOnBooks = async (req: Request, res: Response) => {};

export = {
  getMediaById,
  getMediaByCategories,
  searchMedia,
  getMediaLists,
  getRecommendations,
  getSeason,
  getEpisode,
  getTrending,
  filterByGenre,
  isMediaBasedOnBook,
  getMoviesBasedOnBooks,
};

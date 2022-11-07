import mongoose from 'mongoose';
import Movie from '../models/Movie';
import Tv from '../models/Tv';
import Book from '../models/Book';
import Season from '../models/Season';
import Episode from '../models/Episode';


class Selector {
  chooseModel(mediaType: string) {
    switch (mediaType) {
      case 'movie':
        return Movie;
      case 'tv':
        return Tv;
      case 'season':
        return Season;
      case 'episode':
        return Episode;
      case 'book':
        return Book;
      default:
        return null;
    }
  }
  chooseCommentParent(mediaType: string) {
    switch (mediaType) {
      case 'movie':
        return 'parentMovie';
      case 'tv':
        return 'parentTv';
      case 'season':
        return 'parentSeason';
      case 'episode':
        return 'parentEpisode';
      case 'book':
        return 'parentBook';
      default:
        return null;
    }
  }
}

export default Selector;

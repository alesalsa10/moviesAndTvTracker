import mongoose from 'mongoose';

class Selector {
  chooseModel(mediaType: string) {
    switch (mediaType) {
      case 'movie':
        return mongoose.model('Movie');
      case 'tv':
        return mongoose.model('Tv');
      case 'season':
        return mongoose.model('Season');
      case 'episode':
        return mongoose.model('Episode');
      case 'book':
        return mongoose.model('Book');
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

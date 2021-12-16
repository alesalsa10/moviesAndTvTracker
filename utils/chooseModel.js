const mongoose = require('mongoose')

const chooseModel = (mediaType) =>{
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
        return null
    }
}

module.exports = chooseModel;
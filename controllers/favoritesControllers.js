const User = require('../models/User');
const Movie = require('../models/Movie');
const Tv = require('../models/Tv');
const Book = require('../models/Book');
const externalGetMediaById = require('../externalAPI/apiCalls');
const getBook = require('../externalAPI/apiCalls');

const addMovieToFavorites = async (req, res) => {
  const { externalId } = req.params;
  const userId = req.header('userId');
  //find user first
  try {
    let foundUser = await User.findById(userId).select('-password');
    console.log(foundUser);
    if (foundUser) {
      let existingMovie = await Movie.findOne({ externalId });
      if (existingMovie) {
        let favoriteExist = foundUser.favoriteMovies.includes(
          existingMovie._id
        );
        if (!favoriteExist) {
          await foundUser.favoriteMovies.push(existingMovie);
          await foundUser.save();
          res.status(201).json({ Msg: 'Bookmark successfully created' });
        } else {
          res.status(409).json({ Msg: 'Already exist' });
        }
      } else {
        res
          .status(500)
          .json({ Msg: 'There was a problem adding your favorite' });
      }
    } else {
      res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ Msg: 'Something went wrong while trying to find this user' });
  }
};

const addTvToFavorites = async (req, res) => {
  const { externalId } = req.params;
  const userId = req.header('userId');
  //find user first
  try {
    let foundUser = await User.findById(userId).select('-password');
    console.log(foundUser);
    if (foundUser) {
      let existingTv = await Tv.findOne({ externalId });
      if (existingTv) {
        let favoriteExist = foundUser.favoriteTv.includes(existingTv._id);
        if (!favoriteExist) {
          await foundUser.favoriteTv.push(existingTv);
          await foundUser.save();
          res.status(201).json({ Msg: 'Bookmark successfully created' });
        } else {
          res.status(409).json({ Msg: 'Already exist' });
        }
      } else {
        res
          .status(500)
          .json({ Msg: 'There was a problem adding your favorite' });
      }
    } else {
      res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ Msg: 'Something went wrong while trying to find this user' });
  }
};

const addBookToFavorites = async (req, res) => {
  const { externalId } = req.params;
  const userId = req.header('userId');
  //find user first
  try {
    let foundUser = await User.findById(userId).select('-password');
    console.log(foundUser);
    if (foundUser) {
      let existingBook = await Book.findOne({ externalId });
      if (existingBook) {
        let favoriteExist = foundUser.favoriteBooks.includes(existingBook._id);
        if (!favoriteExist) {
          await foundUser.favoriteBooks.push(existingBook);
          await foundUser.save();
          res.status(201).json({ Msg: 'Bookmark successfully created' });
        } else {
          res.status(409).json({ Msg: 'Already exist' });
        }
      } else {
        res
          .status(500)
          .json({ Msg: 'There was a problem adding your favorite' });
      }
    } else {
      res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ Msg: 'Something went wrong while trying to find this user' });
  }
};

const getAllFavorites = async (req, res) => {
  //still needs to call movies api to get movie info inside
  //this will be done in a loop keeping count it will break onces it gets to the length of bookmarks length array
  const userId = req.header('userId');
  try {
    let user = await User.findById(userId)
      .select('favoriteBooks favoriteMovies favoriteTv')
      //.populate('favoriteBooks', 'favoriteMovies', 'favoriteTv')
      .lean();
    if (user) {
      console.log(user);
      let favorites = {
        movies: [],
        books: [],
        Tv: [],
      };
      //loop over each list and add to a parent array to return
      for (const favorite of user.favoriteMovies) {
        let movie = await externalGetMediaById('movie', favorite);
        favorites.movies.push(movie);
      }
      for (const favorite of user.favoriteTv) {
        let Tv = await externalGetMediaById('tv', favorite);
        favorites.Tv.push(Tv);
      }
      for (const favorite of user.favoriteBooks) {
        let book = await externalGetMediaById(favorite);
        favorites.Tv.push(book);
      }
      //still need to check books
      res.status(200).json(favorites);
    } else {
      res.status(404).json({ Msg: 'This user does not exist' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const removeMovieFromFavorites = async (req, res) => {
  const { bookmarkId } = req.params;
  const userId = req.header('userId');
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { favoriteMovies: bookmarkId } },
      { multi: true }
    );
    res.status(200).json({ Msg: 'Bookmark deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const removeTvFromFavorites = async (req, res) => {
  const { bookmarkId } = req.params;
  const userId = req.header('userId');
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { favoriteTv: bookmarkId } },
      { multi: true }
    );
    res.status(200).json({ Msg: 'Bookmark deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const removeBookFromFavorites = async (req, res) => {
  const { bookmarkId } = req.params;
  const userId = req.header('userId');
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { favoriteBooks: bookmarkId } },
      { multi: true }
    );
    res.status(200).json({ Msg: 'Bookmark deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

module.exports = {
  addMovieToFavorites,
  addTvToFavorites,
  addBookToFavorites,
  getAllFavorites,
  removeMovieFromFavorites,
  removeTvFromFavorites,
  removeBookFromFavorites,
};

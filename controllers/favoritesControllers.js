const User = require('../models/User');
const Movie = require('../models/Movie');
const Tv = require('../models/Tv');
const Book = require('../models/Book');
const externalGetMediaById = require('../externalAPI/apiCalls');
const getBook = require('../externalAPI/apiCalls');

const toggleMovieFavorite = async (req, res) => {
  const { externalId } = req.params;
  try {
    let foundUser = await User.findById(req.user).select('-password');
    console.log(foundUser);
    if (foundUser) {
      let favoriteExist = foundUser.favoriteMovies.includes(externalId);
      if (!favoriteExist) {
        await foundUser.favoriteMovies.push(externalId);
        await foundUser.save();
        res.status(200).json({ Msg: 'Bookmark created' });
      } else {
        await User.updateOne(
          { _id: req.user },
          { $pull: { favoriteMovies: externalId } },
          { multi: true }
        );
        res.status(200).json({ Msg: 'Bookmark deleted' });
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

const toggleTvFavorite = async (req, res) => {
  const { externalId } = req.params;
  //find user first
  try {
    let foundUser = await User.findById(req.user).select('-password');
    if (foundUser) {
      let favoriteExist = foundUser.favoriteTv.includes(externalId);
      if (!favoriteExist) {
        await foundUser.favoriteTv.push(externalId);
        await foundUser.save();
        res.status(201).json({ Msg: 'Bookmark created' });
      } else {
        //res.status(409).json({ Msg: 'Already exist' });
        await User.updateOne(
          { _id: req.user },
          { $pull: { favoriteTv: externalId } },
          { multi: true }
        );
        res.status(200).json({ Msg: 'Bookmark deleted' });
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

const toggleBookFavorite = async (req, res) => {
  const { externalId } = req.params;
  //find user first
  try {
    let foundUser = await User.findById(req.user).select('-password');
    if (foundUser) {
      let existingBook = await Book.findOne({ externalId });

      let favoriteExist = foundUser.favoriteBooks.includes(externalId);
      if (!favoriteExist) {
        await foundUser.favoriteBooks.push(existingBook);
        await foundUser.save();
        res.status(201).json({ Msg: 'Bookmark created' });
      } else {
        await User.updateOne(
          { _id: req.user },
          { $pull: { favoriteBooks: externalId } },
          { multi: true }
        );
        res.status(200).json({ Msg: 'Bookmark deleted' });
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

module.exports = {
  toggleMovieFavorite,
  toggleTvFavorite,
  toggleBookFavorite,
  getAllFavorites,
};

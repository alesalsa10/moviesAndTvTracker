import User from '../models/User';
import Book from '../models/Book';
import api from '../externalAPI/apiCalls';
import { Request, Response } from 'express';
interface UserAuth extends Request {
  user: string; // or any other type
}

const toggleMovieFavorite = async (req: UserAuth, res: Response) => {
  const { externalId } = req.params;
  try {
    let favoriteExist = await User.findOne({
      _id: req.user,
      favoriteMovies: { $contains: externalId },
    });
    if (!favoriteExist) {
      await User.findByIdAndUpdate(req.user, {
        $push: { favoriteMovies: externalId },
      });
      res.status(200).json({ Msg: 'Bookmark created' });
    } else {
      await User.findByIdAndUpdate(req.user, {
        $pull: { favoriteMovies: externalId },
      });
      res.status(200).json({ Msg: 'Bookmark deleted' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const toggleTvFavorite = async (req: UserAuth, res: Response) => {
  const { externalId } = req.params;
  //find user first
  try {
    let favoriteExist = await User.findOne({
      _id: req.user,
      favoriteTv: { $contains: externalId },
    });
    if (!favoriteExist) {
      await User.findByIdAndUpdate(req.user, {
        $push: { favoriteTv: externalId },
      });
      res.status(201).json({ Msg: 'Bookmark created' });
    } else {
      await User.findByIdAndUpdate(req.user, {
        $pull: { favoriteMovies: externalId },
      });
      res.status(200).json({ Msg: 'Bookmark deleted' });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ Msg: 'Something went wrong while trying to find this user' });
  }
};

const toggleBookFavorite = async (req: UserAuth, res: Response) => {
  const { externalId } = req.params;
  //find user first
  try {
    let favoriteExist = await User.findOne({
      _id: req.user,
      favoriteTv: { $contains: externalId },
    });
    if (!favoriteExist) {
      await User.findByIdAndUpdate(req.user, {
        $push: { favoriteTv: externalId },
      });
      res.status(201).json({ Msg: 'Bookmark created' });
    } else {
      await User.findByIdAndUpdate(req.user, {
        $pull: { favoriteBooks: externalId },
      });
      res.status(200).json({ Msg: 'Bookmark deleted' });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ Msg: 'Something went wrong while trying to find this user' });
  }
};

const getAllFavorites = async (req: UserAuth, res: Response) => {
  try {
    let user: any = await User.findById(req.user)
      .select('favoriteBooks favoriteMovies favoriteTv')
      //.populate('favoriteBooks', 'favoriteMovies', 'favoriteTv')
      .lean();
    console.log(user);
    let movies = [...user.favoriteMovies];
    //if (user) {
    console.log(user);
    let favorites = {
      movies: [],
      books: [],
      Tv: [],
    };
    //loop over each list and add to a parent array to return
    if (user.favoriteMovies.length > 0) {
      for (const favorite of user.favoriteMovies) {
        let movie = await api.externalGetMediaById('movie', favorite);
        favorites.movies.push(movie);
      }
    }

    if (user.favoriteTv.length > 0) {
      for (const favorite of user.favoriteTv) {
        let Tv = await api.externalGetMediaById('tv', favorite);
        favorites.Tv.push(Tv);
      }
    }

    if (user.favoriteBooks.length > 0) {
      for (const favorite of user.favoriteBooks) {
        let book = await api.getBook(favorite);
        favorites.books.push(book);
      }
    }

    //still need to check books
    res.status(200).json(favorites);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

export = {
  toggleMovieFavorite,
  toggleTvFavorite,
  toggleBookFavorite,
  getAllFavorites,
};

import Book from '../models/Book';
import BasedOnBook from '../models/BasedOnBook';
import apiCalls from '../externalAPI/apiCalls';
import { default as axios } from 'axios';
import { Request, Response } from 'express';

const getBookById = async (req: Request, res: Response) => {
  let { bookId } = req.params;
  let foundMedia = await Book.findById(bookId);
  let mediaDetails = await apiCalls.getBook(bookId);
  if (foundMedia) {
    if (mediaDetails.error) {
      res
        .status(mediaDetails.error.status)
        .json({ Msg: mediaDetails.error.Msg });
    } else {
      res.status(200).json({ foundMedia, mediaDetails });
    }
  } else {
    foundMedia = new Book({
      externalId: bookId,
      name: mediaDetails.volumeInfo.title,
    });
    await foundMedia.save();
    if (mediaDetails.error) {
      res.status(mediaDetails.error.status).json({ Msg: mediaDetails.Msg });
    } else {
      res.status(200).json({ foundMedia, mediaDetails });
    }
  }
};

const getBookByIsbn = async (req: Request, res: Response) => {
  const { isbn } = req.params;
  //do something similar as id search
  //look up book by isbn, get and and save with google api id
  //call googleapi and search by isbn
  let mediaDetails = await apiCalls.getBookByIsbn(isbn);
  if (mediaDetails.error) {
    res.status(mediaDetails.error.status).json(mediaDetails.error.Msg);
  } else {
    //res.status(400).json( book.items[0].id );
    try {
      let foundMedia = await Book.findOne({
        externalId: mediaDetails.items[0].id,
      });
      if (foundMedia) {
        mediaDetails = mediaDetails.items[0];
        res.status(200).json({ foundMedia, mediaDetails });
      } else {
        foundMedia = new Book({
          externalId: mediaDetails.items[0].id,
          name: mediaDetails.items[0].volumeInfo.title,
        });
        await foundMedia.save();
        mediaDetails = mediaDetails.items[0];
        res.status(200).json({ foundMedia, mediaDetails });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ Msg: 'Something went wrong, try again later.' });
    }
  }
};

const getBooksByGenre = async (req: Request, res: Response) => {
  let { genre } = req.params;
  let books = await apiCalls.booksByGenre(genre);
  if (books.error) {
    res.status(books.error.status).json({ Msg: books.error.Msg });
  } else {
    res.status(200).json(books);
  }
};

const moviesBasedOnBook = async (req: Request, res: Response) => {
  const book_name: string = req.body.book_name;
  const book_author: string = req.body.book_author;
  try {
    let basedMedia = await BasedOnBook.findOne({
      book_name: book_name,
      book_author: book_author,
    }).lean();
    if (basedMedia) {
      let mediaType = basedMedia.media_type.toLowerCase();
      if (mediaType == 'movie') {
        let mediaDetails = await apiCalls.searchMedia(
          'movie',
          basedMedia.media_name
        );
        if (mediaDetails.err) {
          res
            .status(mediaDetails.error.status)
            .json({ Msg: mediaDetails.error.Msg });
        } else {
          if (mediaDetails.results.length > 0) {
            for (let movie of mediaDetails.results) {
              if (
                new Date(movie.release_date).getFullYear() ==
                basedMedia.release_year
              ) {
                movie.media_type = 'movie';
                return res.status(200).json(movie);
              }
            }
          }
          return res.status(404).json({ Msg: 'Nothing found' });
        }
      } else if ((mediaType = 'tv')) {
        let mediaDetails = await apiCalls.searchMedia(
          'tv',
          basedMedia.media_name
        );
        if (mediaDetails.error) {
          res
            .status(mediaDetails.error.status)
            .json({ Msg: mediaDetails.error.Msg });
        } else {
          if (mediaDetails.results.length > 0) {
            for (let movie of mediaDetails.results) {
              if (
                movie.first_air_date.getFullYear() === basedMedia.release_year
              ) {
                movie.media_type = 'tv';
                return res.status(200).json(movie);
              }
            }
          }
          return res.status(404).json({ Msg: 'Nothing found' });
        }
      }
    } else {
      return res.status(404).json({ Msg: 'No media made based on this book' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const searchBook = async (req: Request, res: Response) => {
  let search_query = (req.query.search_query as string).split(' ').join('+');
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${search_query}&maxResults=40&key=${process.env.GOOGLE_BOOKS_KEY}
`
    );
    return res.status(200).json(response.data);
  } catch (err) {
    console.log(err.response.data);
    return res
      .status(err.response.data.error.code)
      .json({ Msg: err.response.data.error.message });
  }
};

const booksByAuthor = async (req: Request, res: Response) => {
  let author: string = req.params.author.split(' ').join('+');
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}&maxResults=10&key=${process.env.GOOGLE_BOOKS_KEY}
`
    );
    return res.status(200).json(response.data);
  } catch (err) {
    console.log(err.response.data);
    return res
      .status(err.response.data.error.code)
      .json({ Msg: err.response.data.error.message });
  }
};

const getBestSellers = async (req: Request, res: Response) => {
  try {
    let response = await axios.get(
      `${process.env.NY_TIMES_URL}/lists/overview.json?api-key=${process.env.NY_TIMES_KEY}`
    );
    res.status(200).json(response.data.results.lists);
    //best sellers uses googleapi image for theirs
    //use isbn to look up book on google api when I click on the book
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const getBooksWithMovies = async (req: Request, res: Response) => {};

export = {
  getBookById,
  getBooksByGenre,
  searchBook,
  getBestSellers,
  getBookByIsbn,
  booksByAuthor,
  moviesBasedOnBook,
  getBooksWithMovies,
};

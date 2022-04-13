const Book = require('../models/Book');
const BasedOnBook = require('../models/BasedOnBook');
const apiCalls = require('../externalAPI/apiCalls');
const { default: axios } = require('axios');

const getBookById = async (req, res) => {
  let { bookId } = req.params;
  console.log(bookId);
  let foundMedia = await Book.findById(bookId);
  let mediaDetails = await apiCalls.getBook(bookId);
  console.log(mediaDetails, '44');
  if (foundMedia) {
    if (mediaDetails.error) {
      res.status(mediaDetails.error.status).json({ Msg: mediaDetails.error.Msg });
    } else {
      res.status(200).json({ foundMedia, mediaDetails });
    }
  } else {
    foundMedia = new Book({ _id: bookId, name: mediaDetails.volumeInfo.title});
    await foundMedia.save();
    if (mediaDetails.error) {
      res.status(foundMedia.error.status).json({ Msg: foundMedia.error.Msg });
    } else {
      res.status(200).json({ foundMedia, mediaDetails });
    }
  }
};

const getBookByIsbn = async (req, res) => {
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
      let foundMedia = await Book.findOne({ _id: mediaDetails.items[0].id });
      if (foundMedia) {
        mediaDetails = mediaDetails.items[0];
        res.status(200).json({ foundMedia, mediaDetails });
      } else {
        foundMedia = new Book({
          _id: mediaDetails.items[0].id,
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

const getBooksByGenre = async (req, res) => {
  let { genre } = req.params;
  let books = await apiCalls.booksByGenre(genre);
  if (books.error) {
    res.status(books.error.status).json({ Msg: books.error.Msg });
  } else {
    res.status(200).json(books);
  }
};

const doesBookHaveMedia = async (req, res) => {
  //THIS STILL NEEDS TO BE TESTED
  //tells if there are any movies or tv shows based on the book
  let { bookId } = req.params;
  let mediaDetails = await apiCalls.getBook(bookId);
  console.log(mediaDetails);
  if (mediaDetails.error) {
    res.status(mediaDetails.error.status).json({ Msg: mediaDetails.error.Msg });
  } else {
    //res.status(200).json({ foundMedia, mediaDetails });
    //search basedOnBook model for a mediaDetails name and author last name

    let authorLastName = mediaDetails.volumeInfo.authors[0].split(' ');
    authorLastName = authorLastName[authorLastName.length - 1].replace('"', '');
    let basedBook = await BasedOnBook.findOne({
      book_name: mediaDetails.volumeInfo.title,
      book_author: authorLastName,
    }).lean();
    if (basedBook) {
      let mediaType = basedBook.media_type.toLowerCase();
      if (mediaType == 'movie') {
        let mediaDetails = await apiCalls.searchMedia(
          'movie',
          basedBook.media_name
        );
        if (mediaDetails.err) {
          res
            .status(foundMedia.error.status)
            .json({ Msg: foundMedia.error.Msg });
        } else {
          res.status(200).json(mediaDetails.results[0]);
        }
      } else if ((mediaType = 'tv')) {
        let mediaDetails = await apiCalls.searchMedia(
          'tv',
          basedBook.media_name
        );
        if (mediaDetails.error) {
          res
            .status(foundMedia.error.status)
            .json({ Msg: foundMedia.error.Msg });
        } else {
          res.status(200).json(mediaDetails.results[0]);
        }
      }
      //if one is found call tmbd api for a search with those paraments
      //if result is found search to make sure it doesn't exist on our db
      //it it exists, just return the media from tmdb and the model in my db
    } else {
      res
        .status(404)
        .json({ Msg: 'This book has no media associated with it' });
    }
  }
};

const searchBook = async (req, res) => {
  let search_query = req.query.search_query.split(' ').join('+');
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

const booksByAuthor = async (req, res) => {
  console.log(req.params)
  let author = req.params.author.split(' ').join('+');
  console.log(author)
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

const getBestSellers = async (req, res) => {
  try {
    let response = await axios.get(
      `${process.env.NY_TIMES_URL}/lists/overview.json?api-key=${process.env.NY_TIMES_KEY}`
    );
    console.log(response.data.results.lists);
    res.status(200).json(response.data.results.lists);
    //best sellers uses googleapi image for theirs
    //use isbn to look up book on google api when I click on the book
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

module.exports = {
  getBookById,
  getBooksByGenre,
  doesBookHaveMedia,
  searchBook,
  getBestSellers,
  getBookByIsbn,
  booksByAuthor
};

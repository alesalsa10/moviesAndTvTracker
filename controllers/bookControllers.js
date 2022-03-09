const Book = require('../models/Book');
const BasedOnBook = require('../models/BasedOnBook');
const apiCalls = require('../externalAPI/apiCalls');
const { default: axios } = require('axios');

const getBookById = async (req, res) => {
  let { bookId } = req.params;
  console.log(bookId);
  let foundBook = await Book.findById(bookId);
  let bookInfo = await apiCalls.getBook(bookId);
  console.log(bookInfo, '44');
  if (foundBook) {
    if (bookInfo.error) {
      res.status(bookInfo.error.status).json({ Msg: bookInfo.error.Msg });
    } else {
      res.status(200).json({ foundBook, bookInfo });
    }
  } else {
    foundBook = new Book({ _id: bookId });
    await foundBook.save();
    if (bookInfo.error) {
      res.status(foundBook.error.status).json({ Msg: foundBook.error.Msg });
    } else {
      res.status(200).json({ foundBook, bookInfo });
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
  let bookInfo = await apiCalls.getBook(bookId);
  console.log(bookInfo);
  if (bookInfo.error) {
    res.status(bookInfo.error.status).json({ Msg: bookInfo.error.Msg });
  } else {
    //res.status(200).json({ foundBook, bookInfo });
    //search basedOnBook model for a bookInfo name and author last name

    let authorLastName = bookInfo.volumeInfo.authors[0].split(' ');
    authorLastName = authorLastName[authorLastName.length - 1].replace('"', '');
    let basedBook = await BasedOnBook.findOne({
      book_name: bookInfo.volumeInfo.title,
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
          res.status(foundBook.error.status).json({ Msg: foundBook.error.Msg });
        } else {
          res.status(200).json(mediaDetails.results[0]);
        }
      } else if ((mediaType = 'tv')) {
        let mediaDetails = await apiCalls.searchMedia(
          'tv',
          basedBook.media_name
        );
        if (mediaDetails.error) {
          res.status(foundBook.error.status).json({ Msg: foundBook.error.Msg });
        } else {
          res.status(200).json(mediaDetails.results[0]);
        }
      }
      //if one is found call tmbd api for a search with those paraments
      //if result is found search to make sure it doesn't exist on our db
      //it it exists, just return the media from tmdb and the model in my db
      //else create a new media, and return it with the model
    } else {
      res
        .status(404)
        .json({ Msg: 'This book has no media associated with it' });
    }
  }
};

const searchBook = async (req, res) => {
  const { searchQuery } = req.params;
  let books = await apiCalls.searchBook(searchQuery);
  if (books.error) {
    res.status(books.error.status).json(books.error.Msg);
  } else {
    res.status(400).json({ books });
  }
};

const getBestSellers = async (req, res) => {
  try {
    let response = await axios.get(
      `${process.env.newYorkTimesBaseUrl}/lists/overview.json?api-key=${process.env.newYorkTimesKey}`
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

const getBookByIsbn = async(req, res)=>{
  const {isbn} = req.params;
  //do something similar as id search
  //look up book by isbn, get and and save with google api id
  //call googleapi and search by isbn
  let book = await apiCalls.getBookByIsbn(isbn);
  if (book.error) {
    res.status(book.error.status).json(book.error.Msg);
  } else {
    //res.status(400).json( book.items[0].id );
    try{
      let foundBook = await Book.findOne({_id: book.items[0].id});
      if(foundBook){
        res.status(200).json({foundBook, book})
      }else {
        foundBook = new Book({ _id: book.items[0].id });
        await foundBook.save();
        res.status(200).json({foundBook, book})
      }
    }catch(error){
      console.log(error);
      res.status(500).json({Msg: 'Something went wrong, try again later.'})
    }
  }
}

module.exports = {
  getBookById,
  getBooksByGenre,
  doesBookHaveMedia,
  searchBook,
  getBestSellers,
  getBookByIsbn
};

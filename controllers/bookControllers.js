const Book = require('../models/Book');
const apiCalls = require('../externalAPI/apiCalls');

const getBookById = async(req, res) =>{
    let {bookId} = req.params;
    console.log(bookId)
    let foundBook = await Book.findById(bookId);
    let bookInfo = await apiCalls.getBook(bookId);
    console.log(bookInfo, '44')
    if(foundBook){
        if(bookInfo.error){
            res
              .status(bookInfo.error.status)
              .json({ Msg: bookInfo.error.Msg });
        }else{
            res.status(200).json({foundBook, bookInfo})
        }
    }else{
        foundBook = new Book({_id: bookId})
        await foundBook.save();
        if (bookInfo.error) {
          res
            .status(foundBook.error.status)
            .json({ Msg: foundBook.error.Msg });
        } else {
          res.status(200).json({ foundBook, bookInfo });
        }
    }
}

const getBooksByGenre = async(req, res) =>{
    let {genre} = req.params;
    let books = await apiCalls.booksByGenre(genre);
    if(books.error){
        res.status(books.error.status).json({Msg: books.error.Msg})
    }else {
        res.status(200).json(books)
    }
}

module.exports = {
    getBookById,
    getBooksByGenre
}
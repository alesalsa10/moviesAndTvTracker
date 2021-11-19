const Book = require('../models/Book');
const getBook = require('../externalAPI/apiCalls');

const getBookById = async(req, res) =>{
    let {bookId} = req.params;
    let foundBook = await Book.findById(bookId);
    let bookInfo = await getBook(bookId);
    console.log(bookInfo)
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

module.exports = {
    getBookById,
}
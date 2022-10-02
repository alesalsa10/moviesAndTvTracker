import mongoose from 'mongoose';
// const BasedOnBookSchema = new mongoose.Schema({}, { strict: false });
// const BasedOnBook = mongoose.model(
//   'BasedOnBook',
//   BasedOnBookSchema,
//   'basedOnBook'
// );



// export default BasedOnBook;

const BasedOnBookSchema = new mongoose.Schema({
  media_name: String,
  release_year: Number,
  media_type: String,
  book_name: String,
  book_author: String,
  amazon_link: String,
  param: String,
});

const BasedOnBook = mongoose.model(
  'BasedOnBook',
  BasedOnBookSchema,
  'basedOnBook'
);

export default BasedOnBook;
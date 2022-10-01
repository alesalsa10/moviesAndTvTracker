import mongoose from 'mongoose';
const BasedOnBookSchema = new mongoose.Schema({}, { strict: false });
const BasedOnBook = mongoose.model(
  'BasedOnBook',
  BasedOnBookSchema,
  'basedOnBook'
);

export default BasedOnBook;
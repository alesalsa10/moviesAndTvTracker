const mongoose = require('mongoose');
const BasedOnBookSchema = new mongoose.Schema({}, { strict: false });
const BasedOnBook = mongoose.model(
  'BasedOnBook',
  BasedOnBookSchema,
  'basedOnBook'
);

module.exports = BasedOnBook
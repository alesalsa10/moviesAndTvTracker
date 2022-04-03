const mongoose = require('mongoose');
const db = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //useCreateIndex: true,
    });
    console.log('Mongodb connected');
  } catch (err) {
    console.error(err.message);
    //Exit process with failure, if 1 is not there it defaults to 0 which is exist with success
    process.exit(1);
  }
};

module.exports = connectDb;

import mongoose from 'mongoose';
const db = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(db);
    console.log('Mongodb connected');
  } catch (err) {
    console.error(err.message);
    //Exit process with failure, if 1 is not there it defaults to 0 which is exist with success
    process.exit(1);
  }
};

export default connectDb
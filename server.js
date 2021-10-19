require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDb = require('./config/mongooseConnection');

const userRouter = require('./routes/userRoutes');
const bookmarkRouter = require('./routes/bookmarkRoutes');
const commentsRouter = require('./routes/commentsRoutes');
const mediaRouter = require('./routes/mediaRoutes');

const PORT = process.env.PORT || 3000;
const app = express();


app.use(cors());
connectDb();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('it is working!');
});

app.use('/users', userRouter);
app.use('/bookmarks', bookmarkRouter);
app.use('/comments', commentsRouter);
app.use('/media', mediaRouter);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

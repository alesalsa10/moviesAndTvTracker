require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDb = require('./config/mongooseConnection');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const commentsRouter = require('./routes/commentsRoutes');
const mediaRouter = require('./routes/mediaRoutes');
const favoriteRouter = require('./routes/favoriteRoutes');
const bookRouter = require('./routes/bookRoutes');
const peopleRouter = require('./routes/peopleRoutes');
const configRouter = require('./routes/mediaApiConfigRoute');
const genreRouter = require('./routes/genreRoutes');

const PORT = process.env.PORT || 3000;
const app = express();

//app.use(cors());

let origin =
  process.env.NODE_ENV === 'production'
    ? 'https://www.broadmediacenter.com'
    : 'http://localhost:3001';

app.use(
  cors({
    origin: [origin],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
connectDb();

app.get('/', (req, res) => {
  res.send('it is working!');
});

app.use('/auth', authRoutes);
app.use('/users', userRouter);
app.use('/comments', commentsRouter);
app.use('/media', mediaRouter);
app.use('/favorites', favoriteRouter);
app.use('/book', bookRouter);
app.use('/people', peopleRouter);
app.use('/configuration', configRouter);
app.use('/genre', genreRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

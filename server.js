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

app.get('/api', (req, res) => {
  res.send('it is working!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/book', bookRouter);
app.use('/api/people', peopleRouter);
app.use('/api/configuration', configRouter);
app.use('/api/genre', genreRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

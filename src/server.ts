require('dotenv').config();
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDb from './config/mongooseConnection';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import commentsRouter from './routes/commentsRoutes';
import mediaRouter from './routes/mediaRoutes';
import favoriteRouter from './routes/favoriteRoutes';
import bookRouter from './routes/bookRoutes';
import peopleRouter from './routes/peopleRoutes';
import configRouter from './routes/mediaApiConfigRoute';
import genreRouter from './routes/genreRoutes';

const PORT = process.env.PORT || 3000;
const app = express();

//app.use(cors());

let origin =
  process.env.NODE_ENV === 'production'
    ? 'https://www.broadmediacenter.com'
    : 'http://localhost:3001';

app.use(
  cors({
    origin: origin,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
connectDb();

app.get('/', (req: Request, res: Response) => {
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

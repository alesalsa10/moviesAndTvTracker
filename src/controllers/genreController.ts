import { default as axios } from 'axios';
import {Request, Response} from 'express';

const getGenres = async (req: Request, res: Response) => {
  const { mediaType } = req.params;
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${process.env.TMDB_KEY}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong, try again later' });
  }
};

exports = {
    getGenres
}
import { default as axios } from 'axios';
import {Request, Response} from 'express';

const getPersonById = async (req: Request, res: Response) => {
    const personId: string = req.params.personId;
    try{
        const response = await axios.get(
          `${process.env.TMDB_BASE_URL}/person/${personId}?api_key=${process.env.TMDB_KEY}&append_to_response=images,combined_credits`
        );
        console.log(response)
        res.status(200).json(response.data)
    }catch(error){
        console.log(error);
        res.status(500).json({Msg: 'Something went wrong, try again later'})
    }
};

const getCredits = async(req: Request, res: Response) =>{
    //const {personId, mediaType} = req.params;
    const personId: string = req.params.personId;
    const mediaType: string = req.params.mediaType;
    try{
        const response = await axios.get(
          `${process.env.TMDB_BASE_URL}/person/${personId}/${mediaType}?api_key=${process.env.TMDB_KEY}`
        );
        console.log(response);
        res.status(200).json(response.data);
    }catch(error){
        console.log(error);
        res.status(500).json({Msg: 'Something went wrong, try again later'})
    }
}

const getPopular = async (req: Request, res: Response) => {
  let page = req.query.page;
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/person/popular?api_key=${process.env.TMDB_KEY}&page=${page}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong, try again later' });
  }
};

export = {
  getPersonById,
  getCredits,
  getPopular
};

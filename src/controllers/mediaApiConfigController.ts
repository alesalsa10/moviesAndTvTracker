import { default as axios } from 'axios';
import {Request, Response} from 'express';

const getConfiguration = async (req: Request, res: Response) =>{
    try{
        const response = await axios.get(
          `${process.env.baseUrl}/configuration?api_key=${process.env.TMDB_KEY}`
        );
        res.status(200).json(response.data);
    }catch(error){
        console.log(error);
        res.status(500).json({Msg: 'Something went wrong getting configuration data, try again later'})
    }
}

exports = {getConfiguration}
const { default: axios } = require('axios');

const getPersonById = async (req, res) => {
    const {personId} = req.params;
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

const getCredits = async(req, res) =>{
    const {personId, mediaType} = req.params;
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

const getPopular = async (req, res) => {
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

module.exports = {
  getPersonById,
  getCredits,
  getPopular
};

const { default: axios } = require('axios');

const getPersonById = async (req, res) => {
    const {personId} = req.params;
    try{
        const response = await axios.get(
          `${process.env.baseUrl}/person/${personId}?api_key=${process.env.apiKey}&append_to_response=images,combined_credits`
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
          `${process.env.baseUrl}/person/${personId}/${mediaType}?api_key=${process.env.apiKey}`
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
      `${process.env.baseUrl}/person/popular?api_key=${process.env.apiKey}&page=${page}`
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

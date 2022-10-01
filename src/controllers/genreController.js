const { default: axios } = require('axios');

const getGenres = async (req, res) => {
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

module.exports = {
    getGenres
}
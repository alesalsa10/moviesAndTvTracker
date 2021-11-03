const axios = require('axios');

const externalGetMediaById = async (mediaType, id) => {
  try {
    const response = await axios.get(
      `${process.env.baseURL}/${mediaType}/${id}?api_key=${process.env.apiKey}&append_to_response=videos`
    );
    response.data.Err = null;
    return response.data;
  } catch (err) {
    console.log(err.response.status);
    return {
      error: {
        status: err.response.status,
        Msg: err.response.data.status_message,
      },
    };
  }
};

module.exports = externalGetMediaById;

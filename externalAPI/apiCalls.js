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

const getBook = async (id) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.googleBooksKey}`
    );
    response.data.Err = null;
    console.log(response.data);
    return response.data;
  } catch (err) {
    return {
      error: {
        status: err.response.data.error.code,
        Msg: err.response.data.error.message,
      },
    };
  }
};

const booksByGenre = async (genre) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=10&key=${process.env.googleBooksKey}
`
    );
    response.data.Err = null;
    return response.data;
  } catch (err) {
    console.log(err.response.data);
    return {
      error: {
        status: err.response.data.error.code,
        Msg: err.response.data.error.message,
      },
    };
  }
};

module.exports = { getBook, externalGetMediaById, booksByGenre };

import axios from 'axios';

const externalGetMediaById = async (mediaType: string, id: string) => {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/${mediaType}/${id}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,credits,release_dates,content_ratings,recommendations`
    );
    //response.data.error = null;
    console.log(response.data)
    return response.data;
  } catch (err) {
    console.log(err.response, '123456');
    return {
      error: {
        status: err.response.status,
        Msg: err.response.data.status_message,
      },
    };
  }
};

const getSeasonInfo = async (seasonNumber: string, id: string) => {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,credits,release_dates`
    );
    //response.data.error = null;
    return response.data;
  } catch (err) {
    console.log(err.response, '123456');
    return {
      error: {
        status: err.response.status,
        Msg: err.response.data.status_message,
      },
    };
  }
};

const getEpisodeInfo = async (seasonNumber: string, episodeNumber: string, id: string) => {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${process.env.TMDB_KEY}&append_to_response=videos,credits,release_dates`
    );
    //response.data.error = null;
    return response.data;
  } catch (err) {
    console.log(err.response, '123456');
    return {
      error: {
        status: err.response.status,
        Msg: err.response.data.status_message,
      },
    };
  }
};

const getBook = async (id: string) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_BOOKS_KEY}`
    );
    response.data.Err = null;
    //console.log(response.data);
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

const searchByTitleAndAuthor = async (title:string, author: string) => {
  console.log('sdfdsf', title, author)
  title = title.split(' ').join('+');
  let some = `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}+inauthor:${author}&maxResults=1&key=${process.env.GOOGLE_BOOKS_KEY}`;
  console.log(some)
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}+inauthor:${author}&maxResults=1&key=${process.env.GOOGLE_BOOKS_KEY}
`
    );
    response.data.Err = null;
    //console.log(response.data);
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

const getBookByIsbn = async (isbn: string) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.GOOGLE_BOOKS_KEY}`
    );
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

const booksByGenre = async (genre: string) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=10&key=${process.env.GOOGLE_BOOKS_KEY}
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

const searchMedia = async (mediaType:string, searchQuery: string) => {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/search/${mediaType}?api_key=${process.env.TMDB_KEY}&query=${searchQuery}&include_adult=false`
    );
    response.data.Err = null;
    return response.data;
  } catch (err) {
    return {
      error: {
        status: err.response.status,
        Msg: err.response.data.status_message,
      },
    };
  }
};

export default {
  getBook,
  externalGetMediaById,
  booksByGenre,
  searchMedia,
  getBookByIsbn,
  searchByTitleAndAuthor,
  getSeasonInfo,
  getEpisodeInfo
};

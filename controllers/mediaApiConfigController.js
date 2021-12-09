const { default: axios } = require('axios');

const getConfiguration = async (req, res) =>{
    try{
        const response = await axios.get(
          `${process.env.baseUrl}/configuration?api_key=${process.env.apiKey}`
        );
        res.status(200).json(response.data);
    }catch(error){
        console.log(error);
        res.status(500).json({Msg: 'Something went wrong getting configuration data, try again later'})
    }
}

module.exports = {getConfiguration}
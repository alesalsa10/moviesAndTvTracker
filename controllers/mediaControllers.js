//only need to get the media as creating will only happen when the user tries to interact with it
//it is created with the api key when the user goes to click on given media from the movie database api

const Media = require('../models/Media')

const getMediaById = async (req, res) => {
    const {id} = req.params;
    try{
        let foundMedia = await Media.findById(id).populate('comments').populate({
            path: 'comments',
            populate:{
                path: 'replies'
            }
        })
        if(foundMedia){
            res.status(400).json(foundMedia);
        } else {
            res.status(404).json({Msg: 'Media not found'})
        }
    }catch(error){
        console.log(error);
        res.status(500).json({Msg: 'Something went wrong'})
    }
}

module.exports = {
    getMediaById
}
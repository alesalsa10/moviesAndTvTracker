const mongoose = require('mongoose')

const mediaSchema = new mongoose.Schema({
    mediaType:{
        type: String,
        required: true,
    },
    externalId:{
        type: String,
        required: true,
    },
    comments:[
        {
            type: mongoose.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media
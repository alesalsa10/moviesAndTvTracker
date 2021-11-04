const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
    episodeNumber:{
        type: Number,
        required: true
    },
    season:{
        type: mongoose.Types.ObjectId,
        ref: 'Season'
    },
    _id: Number,
})
import mongoose from 'mongoose';
const VoteSchema = new mongoose.Schema({
    comment: {
        type: mongoose.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    value: {
        type: Number,
        default: 0  //upvote is +1 downvote -1 and 0 is no vote
    },
    postedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
});

const Vote = mongoose.model('Vote', VoteSchema);
export default Vote;
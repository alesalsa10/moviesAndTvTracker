const isLoggedInSameUser = (req, res, next) =>{
    const loggedInUserId = req.user;
    const userId = req.header('userId');

    if(loggedInUserId == userId){
        next();
    }
    else {
        res.status(409).json({Msg: 'Not authorized '})
    }
}

module.exports = isLoggedInSameUser;
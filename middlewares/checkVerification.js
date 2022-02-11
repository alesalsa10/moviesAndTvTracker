const User = require('../models/User');


const checkVerification = async (req, res, next) => {
  //this middleware will run before making any post, put, and delete
  //without email verification users willl only be able to view data
  const userId = req.user;
  if (userId) {
    const user = await User.findById(req.user)
    if(!user){
        return res.status(404).json({msg: "User nor found"})
    }else if(!user.isVerified){
        return res.status(401).json({Msg: 'Only verified users can complete this action'})
    }else {
        next()
    }
  }else {
      return res.status(400).json({Msg: 'No user id was given'})
  }
};

module.exports = checkVerification
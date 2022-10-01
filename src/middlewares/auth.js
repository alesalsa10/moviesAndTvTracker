const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (!token) {
    return res
      .status(403)
      .json({ Msg: 'A token is required for authentication' });
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
      if(err){
        console.log(err)
        return res.status(401).json({Msg: 'Unathorized, please log in again'})
      }
      req.user = decoded.user;
      next()
    } )
  }
};

module.exports = auth;

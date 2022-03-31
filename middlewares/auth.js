const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (!token) {
    return res
      .status(403)
      .json({ Msg: 'A token is required for authentication' });
  } else {
    // try {
    //   //this is the decoded user
    //   const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //   console.log(decoded);
    //   req.user = decoded.user;
    //   next();
    // } catch (error) {
    //   console.log(error);
    //   res.status(401).json({ Msg: 'Unathorized' });
    // }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
      if(err){
        console.log(err)
        return res.status(401).json({Msg: 'Unathorized'})
      }
      req.user = decoded;
      next()
    } )
  }
};

module.exports = auth;

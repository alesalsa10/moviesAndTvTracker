const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (!token) {
    return res
      .status(403)
      .json({ Msg: 'A token is required for authentication' });
  } else {
    try {
      //this is the decoded user
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log(decoded);
      req.user = decoded.user;
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ Msg: 'Something went wrong' });
    }
  }
};

module.exports = auth;

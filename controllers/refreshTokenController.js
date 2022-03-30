const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.status(403); //Forbidden
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    console.log(decoded);
    if (err || foundUser._id.toString() !== decoded.user) {
      console.log(err, foundUser._id.toString(), decoded.user)
      return res.status(403);
    }
    const accessToken = jwt.sign(
      { user: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    console.log('made it here 2');
    res.status(200).json({ accessToken });
  });
};
module.exports = { handleRefreshToken };

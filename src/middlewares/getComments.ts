import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface UserAuth extends Request {
  user: string; // or any other type
}
interface JwtPayload {
  user: string;
}
const getCommentsMiddleware = (
  req: UserAuth,
  res: Response,
  next: NextFunction
) => {
  if (!req.header('Authorization')) {
    return next();
  }
  const token: string = req.header('Authorization').split(' ')[1];
  if (!token) {
    return next();
  } else {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decoded: JwtPayload) => {
        if (err) {
          console.log(err);
          return res
            .status(401)
            .json({ Msg: 'Unathorized, please log in again' });
        }
        req.user = decoded.user;
        next();
      }
    );
  }
};

export default getCommentsMiddleware;

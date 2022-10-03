import { Request, Response, NextFunction } from 'express';
interface UserAuth extends Request {
  user: string; // or any other type
}

const isLoggedInSameUser = (
  req: UserAuth,
  res: Response,
  next: NextFunction
) => {
  const loggedInUserId = req.user;
  const userId = req.header('userId');

  if (loggedInUserId == userId) {
    next();
  } else {
    res.status(409).json({ Msg: 'Not authorized ' });
  }
};

export default isLoggedInSameUser;

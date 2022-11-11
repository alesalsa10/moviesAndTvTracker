import User from '../models/User';
import {Request, Response, NextFunction} from 'express';

interface UserAuth extends Request {
  user: string; // or any other type
}
const checkVerification = async (req: UserAuth, res: Response, next: NextFunction) => {
  //this middleware will run before making any post, put, and delete
  //without email verification users willl only be able to view data
  const user = await User.findById(req.user);
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  } else if (!user.isVerified) {
    return res
      .status(403)
      .json({ Msg: 'Only verified users can complete this action' });
  } else {
    next();
  }
};
export default checkVerification;

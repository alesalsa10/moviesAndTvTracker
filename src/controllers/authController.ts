import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../services/sendEmail';
import crypto from 'crypto';

import User from '../models/User';
import EmailToken from '../models/EmailToken';
import PasswordToken from '../models/PasswordToken';
//import { bool } from 'aws-sdk/clients/signer';
interface UserAuth extends Request {
  user: string; // or any other type
}
const register = async (req: Request, res: Response) => {
  interface Registration {
    email: string;
    password: string;
    name: string;
    username: string;
  }

  const form: Registration = req.body;
  //const { email, password, name, username } = req.body;

  try {
    //check user by username and by email
    let foundUser = await User.findOne({ email: form.email.toLowerCase() });
    let userByUsername = await User.findOne({ username: form.username });

    if (foundUser && userByUsername) {
      return res
        .status(409)
        .json({ Error: 'Username and email already in use' });
    } else if (foundUser) {
      return res.status(409).json({ Error: 'Email already in use' });
    } else if (userByUsername) {
      return res.status(409).json({ Error: 'Username already in use' });
    } else {
      const salt: string = await bcrypt.genSalt(10);
      // hash the password along with our new salt
      const encryptedPassword: string = await bcrypt.hash(form.password, salt);
      const cryptoToken: string = crypto.randomBytes(16).toString('hex');

      //create user
      let foundUser = new User({
        email: form.email,
        password: encryptedPassword,
        name: form.name,
        username: form.username,
      });
      await foundUser.save();
      const newToken = new EmailToken({
        user: foundUser._id,
        token: cryptoToken,
      });
      await newToken.save();
      try {
        await sendEmail(form.email, cryptoToken, 'verify');
        console.log(foundUser);
        const accessToken: string = jwt.sign(
          { user: foundUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' } //15m
        );
        const refreshToken: string = jwt.sign(
          { user: foundUser._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '30d' }
        );
        await User.findByIdAndUpdate(foundUser._id, {
          $push: { refreshTokens: refreshToken },
        });

        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 60,
          secure: true,
          //sameSite: 'None',
        });
        foundUser = await User.findById(foundUser._id).select('-password');
        //.populate('comments');
        return res.status(200).json({
          accessToken,
          Msg: 'A verification email has been sent. It will expire after one hour.',
          foundUser,
        });
      } catch (e) {
        console.log(e);
        res.status(500).json({ Msg: 'Error sending verification email' });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: 'Oops, something went wrong' });
  }
};

const signIn = async (req: Request, res: Response) => {
  interface Registration {
    email: string;
    password: string;
  }
  const form: Registration = req.body;
  //const { password, email } = req.body;
  //check if user exists
  //if no user exist send error invalid crednetial error
  //if user users exist, compared hashed password, if it mataches create jwt token to send back to client
  try {
    let foundUser = await User.findOne({ email: form.email.toLowerCase() });
    if (foundUser) {
      //if user is found with given email or username, compare password with hashed password
      let match: boolean = await bcrypt.compare(
        form.password,
        foundUser.password
      );

      if (match) {
        const accessToken: string = jwt.sign(
          { user: foundUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' } //15m
        );

        const refreshToken: string = jwt.sign(
          { user: foundUser._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '30d' }
        );

        //foundUser.refreshToken = refreshToken; //old
        //foundUser.refreshTokens.push(refreshToken); //new
        //await foundUser.save();
        await User.findByIdAndUpdate(foundUser._id, {
          $push: { refreshTokens: refreshToken },
        });

        foundUser = await User.findById(foundUser._id).select('-password');

        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 60,
          secure: true,
          //sameSite: 'None',
        });
        res.status(201).json({ accessToken, foundUser });
      } else {
        res.status(401).json({ Msg: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ Msg: 'Invalid username or password' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const signout = async (req: UserAuth, res: Response) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  console.log(cookies)
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken: string = cookies.jwt;
  console.log(refreshToken);

  // Is refreshToken in db?
  // const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
  // if (!foundUser) {
  //   res.clearCookie('jwt', { httpOnly: true, secure: true });
  //   return res.sendStatus(204);
  // }

  // foundUser.refreshTokens.pull(refreshToken);
  // await foundUser.save();

  // res.clearCookie('jwt', { httpOnly: true, secure: true });
  // res.sendStatus(204);
  if (req.user) {
    await User.findByIdAndUpdate(req.user, {
      $pull: { refreshTokens: refreshToken },
    });
    res.clearCookie('jwt', { httpOnly: true, secure: true });
    return res.status(204);
  } else {
    res.clearCookie('jwt', { httpOnly: true, secure: true });

    return res.status(204);
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const paramToken: string = req.params.token;
  const token = await EmailToken.findOne({
    token: paramToken,
  });
  //check if token is not found(will be romoved with a cron job in the future)
  //if it is found, check that it has not expired
  if (!token) {
    return res
      .status(404)
      .json({ Msg: 'Token not found, it might  have expired' });
  } else {
    let currentDate: Date = new Date(Date.now());
    if (token.expiresAt < currentDate) {
      return res.status(401).json({ Msg: 'Token has expired' });
    } else {
      try {
        //find user where token is equal to the sent token,
        //change user isVerified to true
        //delete token
        const user = await User.findOne({
          _id: token.user,
        });
        if (!user) {
          return res.status(401).send({
            Msg: 'We were unable to find a user for this verification.',
          });
        } else if (user.isVerified) {
          return res
            .status(200)
            .send('User has been already verified. Please Login');
        } else {
          //delete the token from the database since I don't have con job yet
          await EmailToken.findByIdAndDelete(token._id);

          //verify account
          await User.findByIdAndUpdate(token.user, { isVerified: true });
          await EmailToken.findByIdAndDelete(token._id);
          res
            .status(200)
            .json({ Msg: 'Your account has been successfully verified' });
        }
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .json({ Msg: 'Could not verify token, try again later' });
      }
    }
  }
};

const resendVerificationEmail = async (req: Request, res: Response) => {
  //send email to link in the front end
  const email: string = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      Msg: 'We were unable to find a user with that email. Make sure your Email is correct!',
    });
  } else if (user.isVerified) {
    return res
      .status(200)
      .send('This account has been already verified. Please log in.');
  } else {
    //check if user already has a token attached to it, and remove it
    const token = await EmailToken.findOne({
      user: user._id,
    });
    const cryptoToken: string = crypto.randomBytes(16).toString('hex');

    if (token) {
      //delete token
      await EmailToken.findByIdAndDelete(token._id);
    }
    const newToken = new EmailToken({
      user: user._id,
      token: cryptoToken,
    });
    await newToken.save();
    try {
      await sendEmail(email, cryptoToken, 'verify');
      return res.status(200).json({
        Msg: 'A verification email has been sent. It will expire after one hour.',
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ Msg: 'Error sending verification email' });
    }
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  //send the email with link to frontend page which will make a get
  const email: string = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      Msg: 'If your acccount exists, you will receive an email with instructions shortly',
    });
  } else {
    const passwordToken = await PasswordToken.findOne({
      user: user._id,
    });
    const cryptoToken: string = crypto.randomBytes(16).toString('hex');

    if (passwordToken) {
      //delete token
      await PasswordToken.findByIdAndDelete(passwordToken._id);
    }
    const newToken = new PasswordToken({
      user: user._id,
      token: cryptoToken,
    });
    await newToken.save();
    try {
      await sendEmail(email, cryptoToken, 'reset');
      return res.status(200).json({
        Msg: 'If your acccount exists, you will receive an email with instructions shortly',
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ Msg: 'Error sending verification email' });
    }
  }
};

const resetPassword = async (req: Request, res: Response) => {
  //this is the link of the
  const paramToken: string = req.params.token;
  const newPassword: string = req.body.password;
  const token = await PasswordToken.findOne({
    token: paramToken,
  });

  if (!token) {
    return res
      .status(404)
      .json({ Msg: 'Token not found, it might  have expired' });
  } else {
    let currentDate: Date = new Date(Date.now());
    if (token.expiresAt < currentDate) {
      return res.status(401).json({ Msg: 'Token has expired' });
    } else {
      const user = await User.findById(token.user);
      if (!user) {
        return res.status(401).send({
          Msg: 'We were unable to find a user for this verification.',
        });
      } else {
        const salt: string = await bcrypt.genSalt(10);
        const encryptedPassword: string = await bcrypt.hash(newPassword, salt);
        const updatedUser = await User.findByIdAndUpdate(token.user, {
          password: encryptedPassword,
          refreshTokens: [],
        });

        //updatedUser.refreshTokens = []; //new
        await updatedUser.save();
        res.clearCookie('jwt', {
          httpOnly: true,
          //sameSite: 'None',
          secure: true,
        }); //new

        await PasswordToken.findByIdAndDelete(token._id);
        return res.status(200).json({ Msg: 'Password changed successfully' });
      }
    }
  }
};

const changeEmail = async (req: UserAuth, res: Response) => {
  //this is for the user is already logged in
  //previous password check, then new
  interface emailForm {
    currentPassword: string;
    email: string;
  }
  const form: emailForm = req.body;
  //const { currentPassword, email } = req.body;
  try {
    let foundUser = await User.findById(req.user);
    if (foundUser) {
      let match: boolean = await bcrypt.compare(
        form.currentPassword,
        foundUser.password
      );
      console.log(match);
      if (match) {
        //check if user with that given email exists

        let userByEmail = await User.findOne({
          email: form.email.toLowerCase(),
        });
        if (userByEmail) {
          return res.status(401).json({ Msg: 'Email already in use' });
        } else {
          let updated = await User.findByIdAndUpdate(req.user, {
            email: form.email.toLowerCase(),
          });
          console.log(updated);
          return res.status(200).json({ Msg: 'Email updated successfully' });
        }
      } else {
        return res.status(401).json({ Msg: 'Current password is invalid' });
      }
    } else {
      return res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const changePassword = async (req: UserAuth, res: Response) => {
  //this is for the user is already logged in
  //previous password check, then new
  //const { currentPassword, newPassword } = req.body;
  interface AuthForm {
    currentPassword: string;
    newPassword: string;
  }
  const form: AuthForm = req.body;
  try {
    let foundUser = await User.findById(req.user);
    if (foundUser) {
      let match: boolean = await bcrypt.compare(
        form.currentPassword,
        foundUser.password
      );
      console.log(match);
      if (match) {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(form.newPassword, salt);
        const updatedUser = await User.findByIdAndUpdate(req.user, {
          password: encryptedPassword,
          refreshTokens: [], //new
        });

        //newly added
        //foundUser.refreshToken = '';
        // updatedUser.refreshTokens = []; //new
        await updatedUser.save();
        res.clearCookie('jwt', {
          httpOnly: true,
          // sameSite: 'None',
          secure: true,
        }); //new

        return res.status(200).json({ Msg: 'Password updated successfully' });
      } else {
        return res.status(401).json({ Msg: 'Current password is invalid' });
      }
    } else {
      return res.status(404).json({ Msg: 'User not found' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  interface JwtPayload {
    user: string;
  }
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies.jwt) {
    return res.status(403).json({ Msg: 'unathorized' });
  }
  const refreshToken: string = cookies.jwt;
  const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
  console.log(foundUser);
  if (!foundUser) {
    console.log('not found');
    return res.status(401).json({ Msg: 'unathorized' }); //Forbidden
  }
  // evaluate jwt
  else {
    try {
      const { user } = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as JwtPayload;

      if (!user || user !== foundUser._id.toString()) {
        return res.status(401).json({ Msg: 'Unathorized' });
      }
      const accessToken: string = jwt.sign(
        { user: foundUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' } //15m
      );

      const newRefreshToken: string = jwt.sign(
        { user: foundUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      await User.findByIdAndUpdate(foundUser._id, {
        $pull: { refreshTokens: refreshToken },
        $push: { refreshTokens: newRefreshToken },
      });

      //clear old cookies
      res.clearCookie('jwt', {
        httpOnly: true,
        //sameSite: 'None',
        secure: true,
      });

      //save a  new one
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 60,
        secure: true,
        //sameSite: 'None',
      });
      return res.status(200).json(accessToken);
    } catch (err) {
      return res.status(401).json({ Msg: 'Not authorized' });
    }
  }
};

export = {
  register,
  signIn,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  signout,
  refreshToken,
  changeEmail,
};

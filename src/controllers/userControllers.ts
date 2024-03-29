import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../services/sendEmail';
import {Request, Response} from 'express';

// import uploadImage from '../src/services/imageUpload';
// import deletePicture from '../src/services/imageDeletion';

import User from '../models/User';

interface UserAuth extends Request {
  user: string; // or any other type
};

const getUser = async (req: Request, res: Response) => {
  const username: string  = req.params.username;
  try {
    let user = await User.findOne({ username: username })
      .select(
        '-password -refreshToken -refreshTokens -email -favoriteBooks -favoriteTv -favoriteMovies'
      )
      .populate({
        path: 'comments',
        match: { text: { $ne: '[Deleted]' } },
        populate: {
          path: 'parentMovie parentTv parentSeason parentEpisode parentBook',
        },
      });
    if (!user) {
      res.status(404).json({ Msg: 'User not found!' });
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const getSelf = async (req: UserAuth, res: Response) => {
  try {
    let user = await User.findById(req.user).select(
      '-password -refreshToken  -refreshTokens -comments'
    );
    if (!user) {
      res.status(404).json({ Msg: 'User not found!' });
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const editUsername = async (req: UserAuth, res: Response) => {
  //only the username and name can be changed on the profile for now,  password will be able to be changed in later versions
  const username: string = req.body.username;

  try {
    const update = {
      username: username,
    };
    const userWithProposedUsername = await User.findOne({ username });

    //check that no user with this username already exists
    if (!userWithProposedUsername) {
      const user = await User.findByIdAndUpdate(req.user, update, {
        new: true,
      });
      console.log(user);
      res.status(200).json({ Msg: 'Success' });
    } else {
      res.status(409).json({ Msg: 'Username already exists' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const editName = async (req: UserAuth, res: Response) => {
  //only the username and name can be changed on the profile for now,  password will be able to be changed in later versions
  const name: string = req.body.name;

  try {
    const update = {
      name: name,
    };
    const user = await User.findByIdAndUpdate(req.user, update, {
      new: true,
    });
    console.log(user);
    res.status(200).json({ Msg: 'Success' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Msg: 'Something went wrong' });
  }
};

const deleteUser = async (req: UserAuth, res: Response) => {
  const  id: string  = req.params.id;
  const user: string = req.user;
  console.log(id, user);
  if (id == user) {
    try {
      await User.findByIdAndDelete(id);
      res.status(200).json({ Msg: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ Msg: 'Something went wrong' });
    }
  } else {
    res.status(409).json({ Msg: 'You are not authorized to delete this user' });
  }
};

// const uploadProfileImage = async (req, res) => {
//   //look up the user's profile pic first
//   //if it is null, then do singleupload
//   //else delete user's picture from s3, and add the new one
//   try {
//     let foundUser = await User.findById(req.user);
//     if (foundUser) {
//       let profilePicture = foundUser.profilePicture;
//       if (!profilePicture) {
//         //if it is not, then upload directly. it will be null on users with no picture
//         const singleUpload = uploadImage('mediaprofilelogo').single('image');
//         singleUpload(req, res, async function (err) {
//           if (err) {
//             return res.json({
//               success: false,
//               errors: {
//                 title: 'Image Upload Error',
//                 detail: err.message,
//                 error: err,
//               },
//             });
//           }
//           let update = { profilePicture: req.file.location };
//           try {
//             await User.findByIdAndUpdate(userId, update, { new: true });
//             res.status(200).json('Successfull upload');
//           } catch (error) {
//             console.log(error);
//             res
//               .status(500)
//               .json({ Msg: 'Something went wrong trying to find the user' });
//           }
//         });
//       } else {
//         //get users profilePicture link and get its link, which contains the s3 key as last part
//         //delete the image from s3, and then run the same function as above
//         let logoUrl = profilePicture.split('.com/');
//         let s3Key = logoUrl[logoUrl.length - 1]; //get everything after logo .com
//         console.log(s3Key);
//         deletePicture(s3Key, function (err) {
//           if (err) {
//             res
//               .status(500)
//               .json({ Msg: 'Something went wrong removing the image' });
//           } else {
//             //res.status(200).json({Msg: 'Image deleted successfully'});
//             singleUpload(req, res, async function (err) {
//               if (err) {
//                 return res.json({
//                   success: false,
//                   errors: {
//                     title: 'Image Upload Error',
//                     detail: err.message,
//                     error: err,
//                   },
//                 });
//               }
//               let update = { profilePicture: req.file.location };
//               try {
//                 await User.findByIdAndUpdate(userId, update, { new: true });
//                 res.status(200).json('Successfull changed profile picture');
//               } catch (error) {
//                 console.log(error);
//                 res.status(500).json({
//                   Msg: 'Something went wrong trying to find the user',
//                 });
//               }
//             });
//           }
//         });
//       }
//     } else {
//       res.status(404).json({ Msg: 'No user with this ID found' });
//     }
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ Msg: 'Something went wrong while trying to find user' });
//   }
// };

export = {
  getUser,
  editUsername,
  deleteUser,
  //uploadProfileImage,
  getSelf,
  editName
};

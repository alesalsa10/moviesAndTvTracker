// import aws from 'aws-sdk';
// import multer from 'multer';
// import multerS3 from 'multer-s3';
// const s3 = new aws.S3();
// import {Request} from 'express';

// aws.config.update({
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   region: 'us-east-2',
// });

// const fileFilter = (req: Request, file: any, cb: Function) => {
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
//   }
// };

// const uploadImage = (folder: any) => {
//   const upload = multer({
//     fileFilter,
//     storage: multerS3({
//       s3,
//       bucket: process.env.AWSBucketName,
//       contentType: multerS3.AUTO_CONTENT_TYPE,
//       metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//       },
//       key: function (req, file, cb) {
//         let fileName = `${folder}/${file.originalname}${Date.now().toString()}`;
//         cb(null, fileName);
//       },
//     }),
//   });
//   return upload;
// };

// export default uploadImage;
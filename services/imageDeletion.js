const aws = require('aws-sdk');
const s3 = new aws.S3();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'us-east-2',
});

const deletePicture = (filename, callback) => {
  var params = {
    Bucket: process.env.bucketName,
    Key: filename,
  };
  s3.deleteObject(params, function (err, data) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null);
    }
  });
};

module.exports = deletePicture;
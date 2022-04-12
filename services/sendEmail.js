const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport');

//use mailgun to send email in the future
//enable less secure apps again
const options = {
  auth: {
    api_key: process.env.SENDGRID_KEY,
  },
};
 

const sendEmail = async (
  email,
  token,
  emailType
) => {
  try {
    const transporter = nodemailer.createTransport(sgTransport(options))
    if (emailType === 'verify') {
      await transporter.sendMail({
        from: process.env.email,
        to: email,
        subject: 'Please, verify your email',
        html: `
        <p>Click <a href="http://localhost:3001/verify/${token}">Here</a> to verify your email</p>
      `,
      });
    } else {
      await transporter.sendMail({
        from: process.env.email,
        to: email,
        subject: 'Password reset',
        html: `
        <p>Click <a href="http://localhost:3001/forgotPassword/${token}">Here</a> to reset password</p>
      `,
      });
    }

    console.log('email sent sucessfully');
    return { error: false };
  } catch (error) {
    console.log(error, 'email not sent');
    return {
      error: true,
      message: 'Cannot send email',
    };
  }
};
module.exports = sendEmail

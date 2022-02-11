const nodemailer = require('nodemailer')
//use mailgun to send email in the future
//enable less secure apps again
const sendEmail = async (
  email,
  token,
  emailType
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'gmail',
      port: 587,
      secure: true,
      auth: {
        user: process.env.email,
        pass: process.env.pass,
      },
    });
    if (emailType === 'verify') {
      await transporter.sendMail({
        from: process.env.email,
        to: email,
        subject: 'Please, verity your email',
        html: `
        <p>Click <a href="http://localhost:3000/auth/verify/${token}">Here</a> to verify your email</p>
      `,
      });
    } else {
      await transporter.sendMail({
        from: process.env.email,
        to: email,
        subject: 'Password reset',
        html: `
        <p>Click <a href="http://localhost:3000/auth/resetPassword/${token}">Here</a> to reset password</p>
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

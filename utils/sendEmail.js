const nodemailer = require('nodemailer');

const sendEmail = async (email) => {
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

    await transporter.sendMail({
      from: process.env.email,
      to: email,
      subject: "Password reset",
      html:
        '<p>Click <a href="http://localhost:3000/password/reset/' +
        'recovery_token' +
        '">here</a> to reset your password</p>',
    });

    console.log('email sent sucessfully');
  } catch (error) {
    console.log(error, 'email not sent');
  }
};

module.exports = sendEmail;

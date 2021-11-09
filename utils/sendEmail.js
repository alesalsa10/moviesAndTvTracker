const nodemailer = require('nodemailer');

const sendEmail = async (email, userId, resetToken) => {
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
      subject: 'Password reset',
      // html:
      //   '<p>Click <a href="http://localhost:3000/password/reset/' +
      //   resetToken +
      //   '">here</a> to reset your password</p>',
      html: `
        <p>Click <a href="http://localhost:3000/resetPassword/${userId}/${resetToken}">Here</a> to reset password</p>
      `,
    });

    console.log('email sent sucessfully');
  } catch (error) {
    console.log(error, 'email not sent');
    return {
      error: true,
      message: "Cannot send email"
    }
  }
};

module.exports = sendEmail;

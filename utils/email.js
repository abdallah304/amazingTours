const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '4842c9e3a601b9',
      pass: 'e1c23f41d4b4b8',
    },
  });

  const mailOption = {
    from: 'abdallah_abdelwahed',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };

  await transport.sendMail(mailOption);
};

module.exports = sendEmail;

// const transport = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: 'abdallah.abdelwahed.14@gmail.com',
//     pass: 'thismygmail',
//   },
// });

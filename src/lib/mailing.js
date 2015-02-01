// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('mailing.js');

var nodemailer = require('nodemailer');
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.email.user,
        pass: config.email.pw
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

function sendMail(fromInput, toInput, subjectInput, textInput, htmltextInput, attachmentsInput) {
  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: fromInput, // sender address
      to: toInput, // list of receivers
      subject: subjectInput, // Subject line
      text: textInput, // plaintext body
      html: htmltextInput, // html body
      attachments: attachmentsInput
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      }
  });
};

exports.sendMail = sendMail;
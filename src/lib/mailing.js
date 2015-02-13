// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('mailing.js');

var nodemailer = require('nodemailer'),
    Q = require('q');
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
          logging.error(error);
      }else{
          logging.debug('Message sent: ' + info.response);
      }
  });
};

function sendMailAsync(mailInput) {
  var deffered = Q.defer();
  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: mailInput.from, // sender address
      to: mailInput.to, // list of receivers
      subject: mailInput.subject, // Subject line
      text: mailInput.text, // plaintext body
      html: mailInput.htmltext, // html body
      attachments: mailInput.attachments
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          logging.error(error);
          deffered.reject(error);
      }else{
          logging.debug('Message sent: ' + info.response);
          deffered.resolve(info);
      }
  });

  return deffered.promise;
}

exports.sendMail = sendMail;
var logging = require('../../config/logging.js').getLogger('GoogleCalendar.js');
var googleAuth = require('google-oauth-jwt');
var gcal = require('google-calendar');
var dateFormat = require('dateformat');

var GoogleCalendar = function(email, keyFile, calendarId) {
  this.email = email;
  this.keyFile = keyFile;
  this.calendarId = calendarId;
}
    
GoogleCalendar.prototype.getCalendar = function (anonymized, callback) {
  var self = this;
  authenticate.call(self, function (err, token) {
    if(err) {
      // See authenticate
    } else {
      gcal(token).events.list(self.calendarId,
        function(err, data) {
          if(err) {
            logging.error("Error retrieving the calendar ", self.calendarId, err);
          } else {
            var returnData;
            if(anonymized) {
              returnData = convertData(data.items);
            } else {
              returnData = data.items;
            }
            callback(err, returnData);
          }
        });
    }
  }); 
};

GoogleCalendar.prototype.insertNewEvent = function (event) {
  var self = this;
  authenticate.call(self, function (err, token) {

  }); 
}

/**
 * Private Method that retrieves the OAuth Access Token for the Google Calendar Account.
 * Uses the google-oauth-jwt module.
 * @param  {Function} callback Callback method returns err and token
 */
function authenticate(callback) {
  googleAuth.authenticate({
    // use the email address of the service account, as seen in the API console
    email: this.email,
    // use the PEM file we generated from the downloaded key
    keyFile: this.keyFile,
    // specify the scopes you which to access
    scopes: ['https://www.googleapis.com/auth/calendar']
  }, function (err, token) {
    if(err) {
      logging.error("Error during authentication ", err);
    }
    callback(err, token);
  });
}

function convertData(items) {
  var convertedData = [];
  if(items) {
    var now = new Date();
    for (var index = items.length - 1; index >= 0; index--) {
      var event = items[index];

      var newEvent = {
        id: event.id,
        start: event.start.date,
        end: event.end.date,
        summary: event.summary
      };

      if(newEvent.start != undefined && new Date(newEvent.start) > now)
        convertedData.push(newEvent);
    };
  }
  return convertedData;
}

exports.GoogleCalendar = GoogleCalendar;
/*=============================================
=            Rent API                    =
=============================================*/

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('rent-api.js');

// External dependencies
var express = require('express'),
    router = express.Router(),
    Q = require('q');

// Dependencies to libs
var routesutil = require('./routesutil.js'),
    cfDB = require('../lib/ForumDB.js'),
    mailUtil = require('../lib/mailing.js');

/**
 * Getter for all rent requests. Can be parameterized based
 * on the status (accepted, rejected) and who accepted/rejected the
 * request.
 *
 * Parameters:
 *   status - accepted/rejected/new
 */
router.get('/rent', function (request, response) {

  var _METHOD = "GET /rent";
  logging.debug("Entering " + _METHOD);

  var status = request.query.status;

   var rentModel =  cfDB.rentmodel;
   rentModel.find()
   .exec(function (err, rentrequest) {
         if(!err) {
            if(rentrequest) {
                routesutil.sendJson(request, response, rentrequest);
            } else {
               response.status(404);
               routesutil.sendJson(request, response, {rentrequest: rentrequest});
            }
         } else {
            response.status(500);
            routesutil.sendJson(request, response, 
               {
                  status: "Ups... something bad happened...",
                  err: err
               });
            logging.error("%s: Internal Server Error. Query could not process.", _METHOD);
         } 
      });
});

var gcal = new (require('../lib/Calendar/GoogleCalendar.js')).GoogleCalendar(config.gcal.email, config.gcal.keyFile, config.gcal.calendarId);


/**
 * Body:
 *   event - Object containing information about the rent request
 * Parameters:
 *   sc - statuschange [accepted/rejected]
 */
router.post('/rent', function (req, resp) {
  
  var _METHOD = "POST /rent";
  logging.debug("Entering " + _METHOD);
  // Get input data
  var newStatus = req.query.sc;
  var rentrequest = req.body;
  
  logging.debug("Parameters: newStatus = %s; rentrequest = %s;", newStatus, rentrequest);
  var processflow = [];
  // Store the event request in the database
  if(newStatus == "accepted") {
    rentrequest.accepted = true;
    if(!rentrequest.gcal_id) {
      // Create GCal Event from rent request
      var event = { summary:'Vermietung ' + rentrequest.name , 
        start: { dateTime: new Date(rentrequest.date).toISOString() }, 
        end: { dateTime: new Date(rentrequest.date).toISOString() } 
      }
      processflow.push(createGCalEntry(event));
       if(config.email.enabled) {
        // Also send reject mail to requester
        var mailContent = mailContentAccept();
        processflow.push(mailUtil.sendMailAsync());
        var mailContent = mailContentAcceptForum();
        processflow.push(mailUtil.sendMailAsync());
      }
    }
  } else if( newStatus == "rejected" ) {
    rentrequest.accepted = false;
    if(rentrequest.gcal_id) {
      // If the rent request is canceled after an accept delete in GCal 
      processflow.push(removeGCalEntry(rentrequest.gcal_id));
    }
    if(config.email.enabled) {
      // Also send reject mail to requester
      var mailContent = mailContentReject();
      processflow.push(mailUtil.sendMailAsync(mailContent));
    }
  }

  Q.all(processflow).spread(function(gcal, emailReq, emailForum) {
    if(gcal) {
      // Handle gcal response
      logging.debug("GCal resolved ", gcal);
      if(gcal.id)
        rentrequest.gcal_id = gcal.id;
      else 
        rentrequest.gcal_id = "";
    }
    if(emailReq) {
      // Handle emailReq response
      logging.debug("E-Mail-req resolved " , emailReq);
    }
    if(emailForum) {
       // Handle emailForum response
      logging.debug("E-Mail-Forum resolved " , emailForum);
    }
    // Only store it in the DB
    storeInDB(rentrequest).then(function(result) {
      if(result.err) {
        logging.err(result.err);
        response.status(500);
      } else {
        logging(result);
        response.status(200);
        routesutil.sendJson(request, response, {rentrequest: result})
      }
    });
  });

});

function removeGCalEntry(gcal_id) {
  var _METHOD = "removeGCalEntry(gcal_id)";
  logging.debug("Entering " + _METHOD);
  var deferred = Q.defer();
  gcal.deleteEvent(gcal_id, function(err, result) {
    if(err) {
      logging.error(err);
      deferred.resolve(err);
    } else {
      logging.debug("Remove result", result);
      deferred.resolve(result);
    }
  });
  return deferred.promise;
}

function createGCalEntry(event) {
  var _METHOD = "createGCalEntry(event)";
  logging.debug("Entering " + _METHOD);
  var deferred = Q.defer();
  // If it is a new event which gets accepted store it into GCal
  gcal.insertNewEvent(event, function(err, result) {
    if(err) {
      deferred.reject(err);
    } else {
      logging.debug("Result is ", result);
      deferred.resolve(result);
    }
  });
  return deferred.promise;
}

function storeInDB(rentrequest) {
  var _METHOD = "storeInDB(rentrequest)";
  logging.debug("Entering " + _METHOD);

  var deferred = Q.defer();
  var rentModel =  cfDB.rentmodel;

  rentModel.findByIdAndUpdate(rentrequest._id, rentrequest ,function(err, rentrequest) {
      if(err) {
        console.log(err);
        deferred.reject(err);
      } else {
        console.log(rentrequest);
        deferred.resolve(rentrequest);
      }
   });
  return deferred.promise;
}


function mailContentAccept() {
  return {
      fromInput: 'club.forum.bb@gmail.com',
      toInput: rentrequest.email, 
      subjectInput: 'Deine Anfrage wurde angenommen!', 
      textInput: 'TODO', 
      htmltextInput: 'TODO', 
      attachmentsInput: []
    };
}

function mailContentAcceptForum() {
  return {
      fromInput: 'club.forum.bb@gmail.com', 
      toInput: 'club.forum.bb@gmail.com', 
      subjectInput: 'Deine Anfrage wurde angenommen!', 
      textInput: 'TODO', 
      htmltextInput: 'TODO', 
      attachmentsInput: []
    };
}

function mailContentReject() {
  return {
      fromInput: 'club.forum.bb@gmail.com', 
      toInput: rentrequest.email, 
      subjectInput: 'Deine Anfrage wurde abgelehnt!', 
      textInput: 'TODO', 
      htmltextInput: 'TODO', 
      attachmentsInput: []
    };
}

module.exports = router;
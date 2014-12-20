/*=============================================
=            Members API                    =
=============================================*/

/**
 * Admin site api thats used to manage the members section. The
 * members have absolutely nothing to do with the users of the 
 * club forum page.
 *
 * :TODO: Maybe extract the get method for general usage...
 */

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('members-api.js');

// External dependencies
var express = require('express'),
    router = express.Router();

// Dependencies to libs
var routesutil = require('./routesutil.js'),
    cfDB = require('../lib/ForumDB.js');

// Private variables
var _memberimglocation = config.paths.members; 

/**
 * GET method to retreive all members. 
 *
 * :TODO: Allow parameters for pagination...
 *  
 * @param  {Object} request
 * @param  {Object} response
 */
router.get('/members', function (request, response) {

  var _METHOD = "GET /members";
  logging.debug("Entering " + _METHOD);

   var membersModel =  cfDB.membersmodel;
   membersModel.find()
   .exec(function (err, members) {
         if(!err) {
            if(members) {
                routesutil.sendJson(request, response, members);
            } else {
               response.status(404);
               routesutil.sendJson(request, response, {members: members});
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

/**
 * Post Method. Only used to add a new member.
 * 
 * @param  {Object} request  Request object
 * @param  {Object} response Response object
 */
router.post('/members', function (request, response) {
  
  var _METHOD = "POST /members";
  logging.debug("Entering " + _METHOD);

  var body = request.body;
  var image = body.img;

  if(image) {
    body.hasImg = true;
  }

  // Ceate the new document
  var membersModel =  cfDB.membersmodel;
  var newMember = new membersModel(body); 
  
  // And store it into the DB
   newMember.save(function(err, newMember) {
      if(!err) {
        var id = newMember._id;

        if(image) {
          routesutil.storeImage(id, image, _memberimglocation);
        }

        response.status(200);
        response.set({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        // :TODO: Strip down to the essentials!
        routesutil.sendJson(request, response, newMember);
      } else {
        response.status(500);
        response.set({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        });   
        routesutil.sendJson(request, response, 
          {
           status: "Ups... something bad happened...",
           err: err
          }); 
      }
   });
});

/**
 * Updates an already existing member. Cannot be used to insert
 * a new member.
 * @param  {Object} request  Request object
 * @param  {Object} response Response object
 */
router.put('/members/:memberId', function (request, response) {
  var _METHOD = "PUT /members/:memberId";
  logging.debug("Entering " + _METHOD);

  var body = request.body;
  var id = request.params.memberId;
  var image = body.img;

  if(image == 'clear' ) {
    routesutil.deleteImage(id, _memberimglocation);
  }else if(image) {
    routesutil.storeImage(id, image, _memberimglocation);  
  }

  var membersModel =  cfDB.membersmodel;
  membersModel.findByIdAndUpdate(id, body, function (err, updatedMember) {      
    if(updatedMember) {
          response.status(200);
                response.set({
                     'Content-Type': 'application/json',
                     'Cache-Control': 'no-cache'
                  });
          routesutil.sendJson(request, response, updatedMember);
      } else {
         response.status(500);
          response.set({
               'Content-Type': 'application/json',
               'Cache-Control': 'no-cache'
            });   
          routesutil.sendJson(request, response, {status:"ERROR UPDATE"});
      }
   });
});

/**
 * Delete method for an member.
 * @param  {Object} request  Request object
 * @param  {Object} response Response object
 */
router.delete('/members/:memberId', function (request, response) {
  var _METHOD = "DELETE /members/:memberId";
  logging.debug("Entering " + _METHOD);

  var id = request.params.memberId;
  logging.debug('%s: Delete article with Id %s', _METHOD, id);
  
  var membersModel =  cfDB.membersmodel;
  membersModel.remove({ _id: id}, function (err) {
    if(!err) {

      // Delete the image if there is one
      routesutil.deleteImage(id, _memberimglocation);

       response.status(200);
        response.set({
          'Status': 'OK'
        });
        response.send();
    } else {
       response.status(404);
        response.set({
          'Status': 'File not found!'
        });
        response.send();
    }
  });
});

module.exports = router;
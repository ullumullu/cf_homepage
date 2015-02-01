/*=============================================
=            Rent API                    =
=============================================*/

/**
 * Admin site api thats used to manage the rent section. 
 *
 * :TODO: Maybe extract the get method for general usage...
 */

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('rent-api.js');

// External dependencies
var express = require('express'),
    router = express.Router();

// Dependencies to libs
var routesutil = require('./routesutil.js'),
    cfDB = require('../lib/ForumDB.js');


router.get('/rent', function (request, response) {

  var _METHOD = "GET /rent";
  logging.debug("Entering " + _METHOD);

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

router.post('/rent', function (request, response) {
  
  var _METHOD = "POST /rent";
  logging.debug("Entering " + _METHOD);


});

module.exports = router;
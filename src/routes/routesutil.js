/*===============================================
=            Routes Helper Functions            =
===============================================*/

/**
 * Collection of various reusable methods used in the 
 * back-end. 
 */

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('routesutil.js');

// External dependencies
var fs = require('fs');

// Static variables
var JSONPREFIX = ")]}',\n";

/**
 * Used to send JSON messages. Adds also the JSONPrefix for security
 * reasons.
 * 
 * @param  {Object} request  Request Object
 * @param  {Object} response Response Object
 * @param  {Object} body     The actual content of the message
 */
exports.sendJson = function(request, response, body) {
  
  var _METHOD = "sendJson(request, response, body)";
  logging.debug("Entering " + _METHOD);

	var resp_body = JSONPREFIX + JSON.stringify(body);
	response.send(resp_body);
  logging.debug("%s: Response send to %s", _METHOD, response.get('host'), {body: resp_body});
};

/**
 * Stores an base 64 image representation into a file on the system. 
 * 
 * @param  {String} id     Of the article. Will be used as filename
 * @param  {String} image  Base64 encoded image as String
 */
exports.storeImage = function storeImage(id, image, location) {
  
  var _METHOD = "storeImage(id, image)";
  logging.debug("Entering " + _METHOD);
  
  var filePath = location+id+'.png';

  if(image.indexOf('data:image') > -1) {
    var base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(filePath, base64Data , 'base64', function(err) {
      logging.error("%s: Error deleting the file %s.png from path %s",
         _METHOD, id, filePath, {error : err});
    });
  }
};


/**
 * Deletes an image from the local server storage. The location
 * should point to the folder where the image is stored.
 * 
 * @param  {String} id       Of the article that should be deleted
 * @param  {String} location Where the corresponding images are stored
 */
exports.deleteImage = function(id, location) {
  
  var _METHOD = "deleteImage(id)";
  logging.debug("Entering " + _METHOD);

  var filePath = location+id+'.png';

  fs.unlink(filePath, function(err) {
    logging.error("%s: Error deleting the file %s.png from path %s",
       _METHOD, id, filePath, {error : err});
  });
}
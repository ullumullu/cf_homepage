/*=============================================
=            Usermanagement API								=
=============================================*/

/**
*	Library that provides methods to create an verify users.
* Used for secure access to the admin area. 
*/

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('usermanagement.js');

// External dependencies
var bcrypt = require('bcrypt')

// Dependencies to libs
var cfDB = require('./ForumDB.js');

// Private variables
var salt = 10; 

/**
 * Adds a new user to the admin db. 
 * 
 * @param {String}   loginName
 * @param {String}   password
 * @param {String}   surname
 * @param {String}   lastname
 * @param {Boolean}  isAdmin
 * @param {Function} callback
 */
var addNewUser = function(loginName, password, surname, lastname, isAdmin, callback) {
	
	var _METHOD = "addNewUser(loginName, password, surname, lastname, isAdmin, callback)";
	logging.debug("Entering " + _METHOD);

	var users = cfDB.usermodule;
	users.find({loginname: loginName}, function (err, user) {
		if(user && user[0]) {
		  callback(loginName, false);
		  logging.error("%s: User with loginName %s already exists", _METHOD, loginName)
		} else {

			bcrypt.hash(password, salt, function(err, hash) {
			 	var newuser = new users({
		 		  		loginname: loginName,
					    password: hash,
					    surname: surname,
					    lastname: lastname,
					    isAdmin: isAdmin
					 });
			 	newuser.save(function (err) {
				 	 if (err) {
				 	 	callback(loginName, false);
				 	 	logging.error("%s: Error adding new user: %j", _METHOD, err);
				 	 } else {
				 	 	callback(loginName, true);
				 	 	logging.info("%s: User %s was succesfully added!", _METHOD, loginName)
				 	 }
				 });
			});

		}
	});
};

/**
 * Updates password of a user. Requires the old PW in order to change.
 * 
 * @param  {String}   loginName
 * @param  {String}   password
 * @param  {Function} callback
 */
var updatePW = function(loginName, password, callback) {

	var _METHOD = "updatePW(loginName, password, callback)";
	logging.debug("Entering " + _METHOD);

	var users = cfDB.usermodule;
	users.find({loginname: loginName}, function (err, user) {
		if(user && user[0]) {

			bcrypt.hash(password, salt, function(err, hash) {
				users.findOneAndUpdate(user[0]._id, {password: hash} , function(err, user) {

				});
			});

		} else {
			callback(loginName, false);
			logging.error("%s: No user was found!", _METHOD, {loginName: loginName})
		}
	});
};

/**
 * Compares the inserted password of the user with the provided loginname with
 * the hash stored inside of the DB. If the comparison is true the user can 
 * proceed to the admin area.
 * 
 * @param  {String}   loginName
 * @param  {String}   password
 * @param  {Function} callback
 * @return {Boolean}
 */
var authenticate = function(loginName, password, callback){	
	
	var _METHOD = "authenticate(loginName, password, callback)";
	logging.debug("Entering " + _METHOD);

	var users = cfDB.usermodule;
	users.find({loginname: loginName}, function (err, user) {
		if(user && user[0]) {

			bcrypt.compare(password, user[0].password, function(err, res) {
			  callback(res);
				logging.debug("%s: Authenticate result is %s", _METHOD, res);
			});

		} else {
			callback(false);
			logging.error("%s: no user with name %s found", _METHOD, loginName);
		}
	});
};

// Export methods for further use
exports.addUser = addNewUser;
exports.updatePW = updatePW;
exports.authenticate = authenticate;
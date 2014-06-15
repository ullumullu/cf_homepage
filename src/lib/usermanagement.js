var bcrypt = require('bcrypt');
var cfDB = require('./ForumDB.js');

var addNewUser = function(loginName, password, surname, lastname, isAdmin, callback) {
	var users = cfDB.usermodule;
	users.find({loginname: loginName}, function (err, user) {
		if(user[0]) {
		   	callback(loginName, false);
		} else {
			console.log('Nothing found for user!');
			bcrypt.hash(password, 10, function(err, hash) {
			 	var newuser = new users({
		 		  		loginname: loginName,
					    password: hash,
					    surname: surname,
					    lastname: lastname,
					    isAdmin: isAdmin
					 });
			 	newuser.save(function (err) {
				 	 if (err) callback(loginName, false);
				 	 else
				 	 	callback(loginName, true);
				 });
			});

		}
	});
};

var updatePW = function(loginName, password, callback) {
	var users = cfDB.usermodule;
	users.find({loginname: loginName}, function (err, user) {
		if(user[0]) {

			bcrypt.hash(password, 10, function(err, hash) {
				users.findOneAndUpdate(user[0]._id, {password: hash} , function(err, user) {

				})

			});
		} else {
			callback(loginName, false);
			console.log('No user found!');
		}
	});
};

var authenticate = function(loginName, password, callback){	
	var users = cfDB.usermodule;
	users.find({loginname: loginName}, function (err, user) {
		if(user[0]) {
			bcrypt.compare(password, user[0].password, function(err, res) {
			    callback(res);
			});
		} else {
			console.log("NO USER");
			callback(false);
		}

	});
};

exports.addUser = addNewUser;
exports.updatePW = updatePW;
exports.authenticate = authenticate;
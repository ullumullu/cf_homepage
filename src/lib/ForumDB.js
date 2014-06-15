var mongoose = require('mongoose');
var homeSchema = require('./schema/home_schema.js');
var userSchema = require('./schema/user_schema.js');

var db = mongoose.connect('mongodb://localhost/clubForum');

var Home = db.model('Home', homeSchema);

var User = db.model('User', userSchema);

exports.homemodel = Home;

exports.usermodule = User;
// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js');
// Required libs
var mongoose = require('mongoose');
// Required schemas
var homeSchema = require('./schema/home_schema.js');
var userSchema = require('./schema/user_schema.js');
var articleSchema = require('./schema/article_schema.js');


var db = mongoose.connect(config.db.hostname);

var Home = db.model('Home', homeSchema);

var User = db.model('User', userSchema);

var Articles = db.model('Articles', articleSchema);

exports.homemodel = Home;

exports.usermodule = User;

exports.articlesmodel = Articles;
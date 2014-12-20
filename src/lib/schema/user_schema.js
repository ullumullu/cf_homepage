/*===================================
=            User Schema            =
===================================*/

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
       loginname: String,
       password: String,
       surname: String,
       lastname: String,
       isAdmin: Boolean
});

module.exports = userSchema;
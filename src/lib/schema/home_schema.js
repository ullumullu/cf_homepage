var mongoose = require('mongoose');

var articleSchema = new mongoose.Schema({
    welcome_text:  String
}, { collection: 'Home' });

module.exports = articleSchema;
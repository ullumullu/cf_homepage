/*=============================================
=            ForumDB Access                   =
=============================================*/

/**
 * Class inheriting access to all collections used. Normal use case
 * is a separate collection per ressource.
 *
 * :TODO: Check if this should be enhanced for better performance 
 * + security.
 */

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('ForumDB.js');
// Dependencies to libs
var mongoose = require('mongoose');
// Required schemas
var schemaLocation = './schema/';
var homeSchema    = require(schemaLocation + 'home_schema.js'),
    userSchema    = require(schemaLocation + 'user_schema.js'),
    articleSchema = require(schemaLocation + 'article_schema.js'),
    memberSchema  = require(schemaLocation + 'member_schema.js');

var db = mongoose.connect(config.db.hostname);
// Access to the single schemas
var Home = db.model('Home', homeSchema),
    User = db.model('User', userSchema),
    Articles = db.model('Articles', articleSchema),
    Members = db.model('Members', memberSchema);

// Export methods for further use
exports.homemodel = Home;
exports.usermodule = User;
exports.articlesmodel = Articles;
exports.membersmodel = Members;
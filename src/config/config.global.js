var config = {};

// Environment configuration
config.appname = "Club Forum Homepage";
config.env = 'production'; // production, environment
config.hostname = 'clubforumbb.de';
config.port = '3000';
config.secret_key = 'forumoldbutgold';
config.requiresauthentication = true;

// File paths
config.paths = {};
config.paths.articles = './src/public/img/articles/';
config.paths.members = './src/public/img/members/';

// Logging
config.logging = 'debug'; //info, warn, error, debug

// SSL configuration - for https conection
config.ssl = {};
config.ssl.enabled = true;
config.ssl.key = 'certificates/key.pem';
config.ssl.cert = 'certificates/cert.pem';
config.ssl.port = '4000';

// Database configuration
config.db = {};
config.db.hostname='mongodb://localhost/clubForum';
config.db.username="";
config.db.password="";

// Google Calendar configuration
config.gcal = {};
config.gcal.email = "YOUREMAIL@PROVIDER.com";
config.gcal.keyFile = "PATHTOYOURKEYFILE";
config.gcal.calendarId = "CALENDARID";

module.exports = config;
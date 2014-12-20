var config = {};

// Environment configuration
config.appname = "Club Forum Homepage";
config.env = 'development'; // production, environment
config.hostname = 'clubforum.de';
config.port = '3000';
config.secret_key = 'forumoldbutgold';
config.requiresauthentication = false;

// File paths
config.paths = {};
config.paths.articles = './src/public/img/articles/';
config.paths.members = './src/public/img/members/';

// Logging
config.logging = 'debug'; //info, warn, error, debug

// SSL configuration - for https conection
config.ssl = {};
config.ssl.enabled = false;
config.ssl.key = 'certificates/key.pem';
config.ssl.cert = 'certificates/cert.pem';
config.ssl.port = '4000';

// Database configuration
config.db = {};
config.db.hostname='mongodb://localhost/clubForum';
config.db.username="";
config.db.password="";

module.exports = config;
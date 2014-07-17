var config = {};

// Environment configuration
config.appname = "Club Forum Homepage";
config.env = 'development';
config.hostname = 'localhost';
config.port = '3000';
config.secret_key = 'forumoldbutgold';
config.logging = 'debug'; //info, warn, error, debug

config.requiresauthentication = false;

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
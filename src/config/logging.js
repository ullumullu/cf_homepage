/*===========================================
=            Logging for CF Page            =
===========================================*/

/**
 * Loggin service & configuration for internal usage. Framework
 * used is winston. 
 *
 * There are two seperate loggers: One for the developemt szenario
 * and the other for production usage.
 */

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('./config.'+env+'.js');
// External Dependencies
var winston = require('winston');

/**
 * Configure the logger for development
 * @type {Logger}
 */
winston.loggers.add('development', {
  console: {
    level: config.logging,
    colorize: 'true',
    label: 'dasdas',
    timestamp: 'true'
  },
  file: {
    filename: './src/logs/development.log'
  }
});

/**
 * Configure the logger for production
 * @type {Logger}
 */
winston.loggers.add('production', {
  console: {
    level: config.logging,
    colorize: 'true',
    label: 'production'
  },
  file: {
    filename: './src/logs/production.log'
  }
});

/**
 * Helper method to retrive the correct logger and set the classname
 * as description.
 * @param  {String} classname
 * @param  {String} level
 * @return {Logger}
 */
function getLogger(classname, level) {
  var _level = level || config.logging;
  var _logger; 
  if(env == 'production') {
    _logger = winston.loggers.get('production');
  } else {
    _logger = winston.loggers.get('development');
  }
  _logger.transports.console.label = classname;
  return _logger;
}

// Export loggers
exports.getLogger = getLogger;

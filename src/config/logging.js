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
    winston.loggers.add(classname, {
      console: {
        level: config.logging,
        colorize: 'true',
        label: classname
      },
      file: {
        filename: './src/logs/production.log'
      }
    });
    _logger = winston.loggers.get(classname);
  } else {
    winston.loggers.add(classname, {
      console: {
        level: config.logging,
        colorize: 'true',
        label: classname,
        timestamp: 'true'
      },
      file: {
        filename: './src/logs/development.log'
      }
    });
     _logger = winston.loggers.get(classname);
  }
  return _logger;
}

// Export loggers
exports.getLogger = getLogger;

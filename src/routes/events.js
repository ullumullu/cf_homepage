
/*=============================================
=            Events API                       =
=============================================*/

/*==========  Gather dependencies and init  ==========*/

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js');
// Init express and the router
var express = require('express');
var router = express.Router();
// Dependencies to libs
var routesutil = require('./routesutil.js');
var cfDB = require('../lib/ForumDB.js');

/*==========  Events Methods  ==========*/


// GET /events/{eventId}

// PUT /events/{eventId}

// DELETE /events/{eventId}

// POST /events/{eventId}

/*==========  Photos Methods  ==========*/

// GET /events/{eventId}/addPhotos

// POST /events/{eventId}/addPhotos

// DELETE /events/{eventId}/addPhotos

module.exports = router;

/*-----  End of Events API  ------*/


/*========================================================================
=            HTTP Server Side Request Methods - Authenticated            =
========================================================================*/

/*==========  Gather dependencies and init  ==========*/

// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js'),
    logging = require('../config/logging.js').getLogger('authenticated.js');

// External dependencies
var express = require('express'),
		router = express.Router();

// Dependencies to libs
var routesutil = require('./routesutil.js'),
		cfDB = require('../lib/ForumDB.js'),
		usermgmt = require('../lib/usermanagement.js');

/*==========  HTTPS Configuration  ==========*/

/**
 * Function. Checks if the protocol used for the request is secured 
 * over https.
 */
var requirehttps = function(request, response, next) {
	
  var _METHOD = "requirehttps(request, response, next)";
  logging.debug("Entering " + _METHOD);

	if(request.protocol === 'https') {
	   if(config.logging === 'debug') {
	      console.log('DEBUG: function requirehttps: HTTPS is used.');
	   } 
		next();
	} else {
		if(config.logging === 'debug') {
		   console.log('DEBUG: Function requirehttps: HTTP is used.');
		} 
		// This is not the "correct" way... however it is more than 
		// sufficient for our needs
		var err = new Error('Forbidden');
		err.status = 403;
		next(err);
	}
};

// If https is enforced this has to be set in the config file
if(config.ssl.enabled) {
	logging.debug("SSL enabled")
	router.all('*', requirehttps);
}

/*==========  Login Methods  ==========*/

/**
 * If no concrete resource is selected decide where to navigate
 * based on the authentication status of the user. If the user is 
 * authenticated redirect to the admin landing page. O.w. render
 * login page.
 */
router.get("/",  function(request, response) {
  
  var _METHOD = "GET /";
  logging.debug("Entering " + _METHOD);

  if(request.session.authenticated) {		
		response.redirect(302, '/adminarea/area');
	} else {
		response.render('adminarea/login_adminarea');
	}
});

/**
 * If the user is authenticated redirect to the admin landing page.
 * O.w. show login page.
 */
router.get("/login",  function(request, response) {

  var _METHOD = "GET /login";
  logging.debug("Entering " + _METHOD);

	if(request.session.authenticated) {
		response.redirect(302, '/adminarea/area');
	} else {
		response.render('adminarea/login_adminarea');
	}
});

/**
 * Do the login action. Verify username and password. If the user
 * exist set a matching session cookie.
 */
router.post("/login",  function(request, response) {

  var _METHOD = "POST /login";
  logging.debug("Entering " + _METHOD);

	var loginname = request.param('loginName', null);
	var password = request.param('password', null);
	usermgmt.authenticate(loginname, password, function(isAuthenticated) {
		if(isAuthenticated) {
			if(config.logging === 'debug') {
			   console.log('DEBUG: POST: /login: User is authenticated');
			} 
			request.session.authenticated = true;
			request.session.loginname =  loginname;
			response.redirect(302, '/adminarea/area');
		} else {
			if(config.logging === 'debug') {
			   console.log('DEBUG: POST: /login: User is not authenticated');
			} 
			response.render('adminarea/login_adminarea', 
					{errorMsg : "Wrong Username and/or Password!"}
				);
		}

	});
});

/*==========  Authentication initialization  ==========*/

/**
 * Verifys if a user is authenticated and if he has the permissions to access the page or 
 * invoke the method.
 */
var requireAuthentication = function(request, response, next) {

  var _METHOD = "requireAuthentication(request, response, next)";
  logging.debug("Entering " + _METHOD);

	if(request.session.authenticated) {
		next();	
	} else {
		var err = new Error('Not authorized');
		err.status = 401;
		next(err);
	}
};

// If authentication is enforced to access the adminarea. Has to
// be set in the configuration.
if(config.requiresauthentication) {
	logging.debug("Authentication enabled");
  router.all('*', requireAuthentication);	
}

/* GET new article page. */
router.get('/area', function(request, response) {
	var _METHOD = "GET /area";
  logging.debug("Entering " + _METHOD);
	// NOTE: if session configures cookies as secure then they aren't passed if http is used!
  response.render('adminarea/area', {loginname: request.session.loginname});
});

/*==========  HomeContent Methods  ==========*/


router.get('/homeContent', function(request, response) {
	var _METHOD = "GET /homeContent";
  logging.debug("Entering " + _METHOD);
	
	var homeModel =  cfDB.homemodel;
	homeModel.find({}, function (err, home) {
		if(home[0]) {
		    response.status(200);
		    response.set({
		    		'Content-Type': 'application/json',
		    		'Cache-Control': 'no-cache'
		    	});
		    routesutil.sendJson(request, response, home[0]);
		} else {
			console.log('Nothing found for Home!');
		}
	});
});

router.post('/homeContent', function(request, response) {
	var _METHOD = "POST /homeContent";
  logging.debug("Entering " + _METHOD);

	var body = request.body;
	var id = body._id;
	var welcome_text = { welcome_text: body.welcome_text_new };

	var homeModel =  cfDB.homemodel;
	homeModel.findByIdAndUpdate(id, welcome_text, function (err, home) {
		if(home) {
		    response.status(200);
				    response.set({
				    		'Content-Type': 'application/json',
				    		'Cache-Control': 'no-cache'
				    	});
		    routesutil.sendJson(request, response, {status:"OK"});
		} else {
			response.status(500);
		    response.set({
		    		'Content-Type': 'application/json',
		    		'Cache-Control': 'no-cache'
		    	});	
		    routesutil.sendJson(request, response, {status:"ERROR UPDATE"});
		}
	});
});


/*==========  Articles Methods  ==========*/
var articles = require('./articles-api.js');
router.use('/managearticles', articles);

/*==========  Members Methods  ==========*/
var members = require('./members-api.js');
router.use('/managemembers', members);

/*==========  Rent Methods  ==========*/
var rent = require('./rent-api.js');
router.use('/managerent', rent);

module.exports = router;

/*-----  End of HTTP Server Side Request Methods - Authenticated  ------*/
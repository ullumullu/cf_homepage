/*========================================================================
=            HTTP Server Side Request Methods - Authenticated            =
========================================================================*/

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
var usermgmt = require('../lib/usermanagement.js');

/*==========  HTTPS Configuration  ==========*/

/**
 * Function. Checks if the protocol used for the request is secured 
 * over https.
 */
var requirehttps = function(request, response, next) {
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
   	if(request.session.authenticated) {
		response.redirect('/adminarea/area', 302);
	} else {
		response.render('adminarea/login_adminarea');
	}
});

/**
 * If the user is authenticated redirect to the admin landing page.
 * O.w. show login page.
 */
router.get("/login",  function(request, response) {
	if(request.session.authenticated) {
		response.redirect('/adminarea/area', 302);
	} else {
		response.render('adminarea/login_adminarea');
	}
});

/**
 * Do the login action. Verify username and password. If the user
 * exist set a matching session cookie.
 */
router.post("/login",  function(request, response) {
	var loginname = request.param('loginName', null);
	var password = request.param('password', null);
	usermgmt.authenticate(loginname, password, function(isAuthenticated) {
		if(isAuthenticated) {
			if(config.logging === 'debug') {
			   console.log('DEBUG: POST: /login: User is authenticated');
			} 
			request.session.authenticated = true;
			request.session.loginname =  loginname;
			response.redirect('area', 302);
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
  router.all('*', requireAuthentication);	
}

/* GET new article page. */
router.get('/area', function(request, response) {
	// NOTE: if session configures cookies as secure then they aren't passed if http is used!
  	response.render('adminarea/adminarea', {loginname: request.session.loginname});
});

/*==========  HomeContent Methods  ==========*/


router.get('/homeContent', function(request, response) {
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
	console.log(request.body);
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
var articles = require('./articles.js');
router.use('/managearticles', articles);

module.exports = router;

/*-----  End of HTTP Server Side Request Methods - Authenticated  ------*/
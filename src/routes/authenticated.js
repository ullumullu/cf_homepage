// App configuration files
var env = process.env.NODE_ENV || 'development',
    config = require('../config/config.'+env+'.js');
    
var express = require('express');
var router = express.Router();

var routesutil = require('./routesutil.js');

var cfDB = require('../lib/ForumDB.js');
var usermgmt = require('../lib/usermanagement.js');

var requirehttps = function(request, response, next) {
	if(request.protocol === 'https') {
		console.log('RESULT: HTTPS');
		next();
	} else {
		console.log('RESULT: HTTP');
		// THis is not the "correct" way... however it is more than sufficient for our needs
		var err = new Error('Forbidden');
		err.status = 403;
		next(err);
	}
};

if(config.ssl.enabled) {
	router.all('*', requirehttps);
}

router.get("/",  function(request, response) {
   	if(request.session.authenticated) {
		response.redirect('adminarea/area', 302);
	} else {
		response.render('adminarea/login_adminarea');
	}
});

router.get("/login",  function(request, response) {
	if(request.session.authenticated) {
		response.redirect('adminarea/area', 302);
	} else {
		response.render('adminarea/login_adminarea');
	}
});

router.post("/login",  function(request, response) {
	var loginname = request.param('loginName', null);
	var password = request.param('password', null);
	usermgmt.authenticate(loginname, password, function(isAuthenticated) {
		if(isAuthenticated) {
			request.session.authenticated = true;
			request.session.loginname =  loginname;
			response.redirect('area', 302);
			console.log("AUTHENTICATED");
		} else {
			response.render('adminarea/login_adminarea', {errorMsg : "Wrong Username and/or Password!"});
			console.log("REJECTED");
		}

	});
});

var requireAuthentication = function(request, response, next) {
	if(request.session.authenticated) {
		next();	
	} else {
		var err = new Error('Not authorized');
		err.status = 401;
		next(err);
	}
};

if(config.requiresauthentication) {
  router.all('*', requireAuthentication);	
}

/* GET new article page. */
router.get('/area', function(request, response) {
  	response.render('adminarea/adminarea');
});

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

/**
*	--- ARTICLES API ---
*   Allowed commands: PUT, POST, GET, DELETE
*/

/**
* Get articles
*/
router.get('/managearticles/articles', function(request, response) {
	var articlesModel =  cfDB.articlesmodel;
	articlesModel.find({})
	.sort({'date': -1})
	.exec(function (err, articles) {
			if(articles) {
			    routesutil.sendJson(request, response, {articles: articles});
			} else {
				response.status(404);
				routesutil.sendJson(request, response, {articles: articles});
			}
		});
});

/**
* This is a brand new article
*/
router.post('/managearticles/articles', function(request, response) {

	var body = request.body;
	// Ceate the new document
	var articlesModel =  cfDB.articlesmodel;
	var newArticle = new articlesModel(body);
	// And store it into the DB
	newArticle.save(function(err, newArticle) {
		if(!err) {
		   response.status(200);
		    response.set({
		    		'Content-Type': 'application/json',
		    		'Cache-Control': 'no-cache'
		    	});
			// :TODO: Strip down to the essentials!
			routesutil.sendJson(request, response, newArticle);
		} else {
			response.status(500);
		    response.set({
		    		'Content-Type': 'application/json',
		    		'Cache-Control': 'no-cache'
		    	});	
		    routesutil.sendJson(request, response, {status:"ERROR CREATE"}); 
		}
	});
});


/**
* And this is an update 
*/
router.put('/managearticles/articles/:articleID', function(request, response) {
   var body = request.body;
	console.log(body);
	var id = request.params.articleID;

	var articlesmodel =  cfDB.articlesmodel;
	articlesmodel.findByIdAndUpdate(id, body, function (err, updatedArticle) {
		if(updatedArticle) {
		    response.status(200);
				    response.set({
				    		'Content-Type': 'application/json',
				    		'Cache-Control': 'no-cache'
				    	});
		    routesutil.sendJson(request, response, updatedArticle);
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

router.delete('/managearticles/articles/:articleID', function(request, response) {
    console.log("ID " + request.params.articleID);
   
    	response.status(200);
		    response.set({
		    	'Status': 'OK'
		    });
		    response.send();
		/* FOR TESTING THE REAL DELETION IS "DEACTIVATED"
    var articlesModel =  cfDB.articlesmodel;
	articlesModel.remove({ _id: request.params.articleID}, function (err) {
		if(!err) {
			response.status(200);
		    response.set({
		    	'Status': 'OK'
		    });
		    response.send();
		} else {
			response.status(404);
		    response.set({
		    	'Status': 'File not found yo!'
		    });
		    response.send();
		}

	});
*/
});

module.exports = router;
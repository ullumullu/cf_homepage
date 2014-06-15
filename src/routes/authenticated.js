var express = require('express');
var router = express.Router();

var cfDB = require('../lib/ForumDB.js');
var usermgmt = require('../lib/usermanagement.js');

var JSONPREFIX = ")]}',\n";

var requirehttps = function(request, response, next) {
	if(request.protocol === 'https') {
		console.log('ITS HTTPS!!!');
		next();
	} else {
		console.log('ITS HTTP!!!');
		// THis is not the "correct" way... however it is more than sufficient for our needs
		var err = new Error('Forbidden');
		err.status = 403;
		next(err);
	}
};

router.all('*', requirehttps);

router.get("/",  function(request, response) {
   	if(request.session.authenticated) {
		response.redirect('area', 302);
	} else {
		response.render('adminarea/login_adminarea');
	}
});

router.get("/login",  function(request, response) {
	if(request.session.authenticated) {
		response.redirect('area', 302);
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
			console.log(request.session.cookie.maxAge);
			response.redirect('area', 302);
			// TODO do the authentication
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


router.all('*', requireAuthentication);

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
		    var body = JSONPREFIX + JSON.stringify(home[0]);
		    response.send(body);
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
			var body = JSONPREFIX + JSON.stringify({status:"OK"});
		    response.send(body);
		} else {
			response.status(500);
		    response.set({
		    		'Content-Type': 'application/json',
		    		'Cache-Control': 'no-cache'
		    	});	
			var body = JSONPREFIX + JSON.stringify({status:"ERROR UPDATE"});
		    response.send(body);
		}
	});


});

router.post('/articles', function(request, response) {
    response.writeHead(200, "OK", {'Content-Type': 'text/html'});
    response.end();
});

module.exports = router;
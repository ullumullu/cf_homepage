var express = require('express');
var bodyParser = require('body-Parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var compression = require('compression');
var path = require('path');
var fs = require('fs');
var hbs = require('hbs');

var app = express();


var home = require('./routes/home');
var authenticated = require('./routes/authenticated');

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'html');
app.engine('html', hbs.__express);

// parse application/json
app.use(compression());
app.use(cookieParser());
app.use(session({ 
    secret: 'keyboard cat', // 
    cookie: { secure: true, maxAge: 3600000 },
    rolling: true 
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/adminarea', authenticated);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
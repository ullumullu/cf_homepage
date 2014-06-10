var express = require('express');
var path = require('path');
var hbs = require('hbs');

var app = express();

var home = require('./routes/home');
var authenticated = require('./routes/authenticated');


app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/private', authenticated);

module.exports = app;
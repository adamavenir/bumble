var express     = require('express');
var logger      = require('bucker').createLogger();
var Bumble      = require('bumble');
var util        = require('util');
var config      = require('./bumbleConfig.json');

var app = express();

app.configure(function () {
    app.use(express.compress());
    app.use(express['static'](__dirname + '/public'));
    // app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.bodyParser());
    app.use(logger.middleware());
});

var bumble = new Bumble(app, config);

app.listen(2000);

logger.info('bumble running on the year 2000');
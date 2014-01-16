var express     = require('express');
var Bumble      = require('bumble');
var config      = require('./bumbleConfig.json');

var app = express();

app.configure(function () {
    app.use(express.compress());
    app.use(express['static'](__dirname + '/public'));
    app.use(express.bodyParser());
});

var bumble = new Bumble(app, config);

app.listen(3000);

console.log('bumble running on the year 3000');

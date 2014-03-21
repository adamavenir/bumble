var Hapi = require('hapi');
var config = require('./bumbleConfig.json');

var server = new Hapi.Server('localhost', 3000);

server.pack.require({ 'bumble': config }, function (err) {
    if (err) throw err;

    server.start(function () {
        console.log('bumble running on the year 3000');
    });
});


var Hapi = require('hapi');
var config = require('./bumbleConfig.json');
var Jade = require('jade');
var Bumble = require('bumble');
var Good = require('good');
var ElectricFence = require('electricfence');

var serverOptions = {
    views: {
        engines: {
            jade: Jade
        },
        isCached: false,
        path: 'views'
    }
};

var server = new Hapi.Server(3000, serverOptions);

server.pack.register([
    { plugin: Bumble, options: config },
    { plugin: Good, options: {} },
    { plugin: ElectricFence, options: {path: 'public', url: '/'} }
], function (err) {
    if (err) throw err;

    server.start(function () {
        console.log('bumble running on the year ' + server.info.port);
    });
});


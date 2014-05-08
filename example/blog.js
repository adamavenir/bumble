var Hapi = require('hapi');
var config = require('./bumbleConfig.json');

var server = new Hapi.Server('0.0.0.0', 3000 || process.env.PORT);

server.views({
    engines: {
        jade: 'jade'
    },
    isCached: false,
    path: 'views',
});

server.pack.require({ bumble: config, good: {}, electricfence: {path: 'public', url: '/'} }, function (err) {
    if (err) throw err;

    server.start(function () {
        console.log('bumble running on the year' + server.info.port);
    });
});


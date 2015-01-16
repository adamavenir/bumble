var Hapi = require('hapi');
var config = require('./bumbleConfig.json');

var server = new Hapi.Server();
server.connection({ port: 3003 });

server.views({
    engines: {
        jade: require('jade')
    },
    isCached: false,
    path: 'views'
});

server.register([
    {
        register: require('../'), // use require('bumble') in real world
        options: config
    },
    {
        register: require('good'),
        options: {
            reporters: [{
                reporter: require('good-console'),
                args: [{ log: '*', response: '*' }]
            }]
        }
    },
    {
        register: require('electricfence'),
        options: {
            path: 'public',
            url: '/'
        }
    }
], function (err) {
    if (err) throw err;

    server.start(function () {
        server.log('info', 'bumble running on the year ' + server.info.port);
    });
});


var Handlers = require('./bumble/handlers');

exports.register = function (plugin, config, next) {
    var home = config.blogHome;
    var handlers = new Handlers(config, next);
    plugin.bind(handlers);
    plugin.route({
        method: 'get',
        path: '/post/{tid}/{tslug}',
        config: {
            handler: handlers.tumblrRedirect,
            description: '301 redirects for old tumblr blog posts',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: '/rss',
        config: {
            handler: handlers.rss,
            description: 'rss',
            tags: ['bumble', 'rss']
        }
    });
    plugin.route({
        method: 'get',
        path: home + '{year}/{month}/{day}/{pslug}',
        config: {
            handler: handlers.blogPost,
            description: 'blog post',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: home + '{datePart*}',
        config: {
            handler: handlers.index,
            description: 'blog index',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: '/*',
        config: {
            handler: handlers.notFound,
            description: '404 page',
            tags: ['bumble', '404']
        }
    });
};


var Handlers = require('./bumble/handlers');
var _ = require('underscore');
var defaults = {
    rssUrl: '/rss',
    postDir: 'posts',
    blogHome: '/',
    maxPosts: 10

};

exports.register = function (plugin, config, next) {
    var handlers, home;
    _.defaults(config, defaults);
    home = config.blogHome;
    config.log = plugin.log;
    handlers = new Handlers(config, function _handlersLoaded() {
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
        next();
    });
};

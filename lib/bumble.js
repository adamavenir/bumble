var Handlers = require('./bumble/handlers');
var _ = require('underscore');
var defaults = {
    rssUrl: '/rss',
    postDir: 'posts',
    blogHome: '/',
    maxPosts: 10,
    avatarSize: 100
};

exports.register = function (plugin, config, next) {
    var handlers, home, servers;
    _.defaults(config, defaults);
    home = config.blogHome;
    config.log = plugin.log;
    servers = (config.labels) ? plugin.select(config.labels) : plugin;
    handlers = new Handlers(config, function _handlersLoaded() {
        servers.bind(handlers);
        servers.ext('onPreResponse', handlers.addGlobalContext);
        servers.route({
            method: 'get',
            path: '/post/{tid}/{tslug}',
            config: {
                handler: handlers.tumblrRedirect,
                description: '301 redirects for old tumblr blog posts',
                tags: ['bumble']
            }
        });
        servers.route({
            method: 'get',
            path: '/rss',
            config: {
                handler: handlers.rss,
                description: 'rss',
                tags: ['bumble', 'rss']
            }
        });
        servers.route({
            method: 'get',
            path: home + '{year}/{month}/{day}/{pslug}',
            config: {
                handler: handlers.blogPost,
                description: 'blog post',
                tags: ['bumble']
            }
        });
        servers.route({
            method: 'get',
            path: home + '{datePart*}',
            config: {
                handler: handlers.index,
                description: 'blog index',
                tags: ['bumble']
            }
        });
        servers.route({
            method: 'get',
            path: home + 'tag{s?}/{tag*}',
            config: {
                handler: handlers.tagIndex,
                description: 'tag index',
                tags: ['bumble']
            }
        });
        servers.route({
            method: 'get',
            path: home + 'author{s?}/{authorSlug*}',
            config: {
                handler: handlers.authorIndex,
                description: 'author index',
                tags: ['bumble']
            }
        });
        servers.route({
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

exports.register.attributes = {
    pkg: require('../package.json')
};

var Handlers = require('./bumble/handlers');
var _ = require('underscore');
var defaults = {
    rssUrl: '/rss',
    postDir: 'posts',
    blogHome: '/',
    maxPosts: 10,
    avatarSize: 100,
    introPostWords: 100,
    maxRelated: 5,
    randomRelated: true,
    callToAction: false
};

exports.register = function (server, config, next) {

    _.defaults(config, defaults);
    var home = config.blogHome;
    config.log = server.log;
    var connections = (config.labels) ? server.select(config.labels) : server;
    var handlers = new Handlers(config, function _handlersLoaded() {

        connections.bind(handlers);
        connections.ext('onPreResponse', handlers.addGlobalContext);

        connections.route({
            method: 'get',
            path: '/post/{tid}/{tslug}',
            config: {
                handler: handlers.tumblrRedirect,
                description: '301 redirects for old tumblr blog posts',
                tags: ['bumble']
            }
        });

        connections.route({
            method: 'get',
            path: '/rss',
            config: {
                handler: handlers.rss,
                description: 'rss',
                tags: ['bumble', 'rss']
            }
        });

        connections.route({
            method: 'get',
            path: home + '{year}/{month}/{day}/{pslug}',
            config: {
                handler: handlers.blogPost,
                description: 'blog post',
                tags: ['bumble']
            }
        });

        connections.route({
            method: 'get',
            path: home + '{datePart*}',
            config: {
                handler: handlers.index,
                description: 'blog index',
                tags: ['bumble']
            }
        });

        connections.route({
            method: 'get',
            path: home + 'tag{s?}/{tag*}',
            config: {
                handler: handlers.tagIndex,
                description: 'tag index',
                tags: ['bumble']
            }
        });

        connections.route({
            method: 'get',
            path: home + 'author{s?}/{authorSlug*}',
            config: {
                handler: handlers.authorIndex,
                description: 'author index',
                tags: ['bumble']
            }
        });

        connections.route({
            method: 'get',
            path: home + 'api/latest',
            config: {
                handler: handlers.latestJSON,
                description: 'blog latest JSON',
                tags: ['bumble', 'api']
            }
        });

        connections.route({
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

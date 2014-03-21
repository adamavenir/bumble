var Views = require('./bumble/views');

var express_routes = {
    notFound: function (req, res) {
        res.render('404', {status: 404, bodyId: 'fourohfour'});
    },
    tumblrRedirect: function (req, res) {
        var url = this.views.tumblrRedirect(req.params);
        if (!url) {
            return this.notFound(req, res);
        }
        return res.redirect(301, url);
    },
    rss: function (req, res) {
        res.set('Content-Type', 'text/xml');
        res.render('rss', this.views.rss());
    },
    index: function (req, res) {
        this.views.blogIndex(req.params.page, function _gotIndex(realPage, context) {
            if (realPage) {
                return res.redirect('/?page=' + realPage);
            }
            res.render('index', context);
        });
    }
};

var hapi_routes = {
    notFound: function (request, reply) {
        reply.view('404', {status: 404, bodyId: 'fourohfour'}).code(404);
    },
    tumblrRedirect: function (request, reply) {
        var url = this.views.tumblrRedirect(request.params);
        if (!url) {
            return this.routes.notFound(request, reply);
        }
        return reply().redirect(url).code(301);
    },
    rss: function (request, reply) {
        reply.view('rss', this.views.rss(), {contentType: 'text/xml'});
    },
    index: function (request, reply) {
        this.views.blogIndex(request.query.page, function _gotIndex(realPage, context) {
            if (realPage) {
                return reply().redirect('/?page=' + realPage);
            }
            reply.view('index', context);
        });
    },
    yearIndex: function (request, reply) {
        this.views.blogYearIndex(request.query.page, request.params.year, function _gotYearIndex(realPage, context) {
            if (realPage) {
                return reply().redirect('/?page=' + realPage);
            }
            reply.view('blogIndex', context);
        });
    },
    monthIndex: function (request, reply) {
        this.views.blogMonthIndex(request.query.page, request.params.year, request.params.month, function _gotYearIndex(realPage, context) {
            if (realPage) {
                return reply().redirect('/?page=' + realPage);
            }
            reply.view('blogIndex', context);
        });
    },
    dayIndex: function (request, reply) {
        this.views.blogDayIndex(request.query.page, request.params.year, request.params.month, request.params.day, function _gotYearIndex(realPage, context) {
            if (realPage) {
                return reply().redirect('/?page=' + realPage);
            }
            reply.view('blogIndex', context);
        });
    },
    blogPost: function (request, reply) {
        this.views.blogPost(request.params.year, request.params.month, request.params.day, request.params.pslug, function _gotBlogPost(context) {
            if (!context) {
                return this.routes.notFound(request, reply);
            }
            reply.view('post', context);
        });
    }
};

exports.express = function bumbleExpress(app, config) {
    var routes = new express_routes(config);
    var home = routes.config.blogHome;
    if (home === '/') { home === ''; }

    this.config = config;
    this.routes = express_routes;
    //this.app = app;

    // use jade
    app.set('view engine', 'jade');

    // 301 redirects for old tumblr blog posts
    app.get('/post/:tid/:tslug', this.routes.tumblrRedirect);

    // rss
    app.get('/rss', this.routes.rss);


    // blog post indexes
    app.get(home, this.routes.index);
    app.get(home + ':year', this.routes.blogYearIndex);
    app.get(home + ':year/:month', this.routes.blogMonthIndex);
    app.get(home + ':year/:month/:day', this.routes.blogDateIndex);

    // blog posts
    app.get(home + ':year/:month/:day/:pslug', this.routes.blogPost);

    // 404
    app.get('*', this.routes.notFound);
};

exports.register = function bumbleHapi(plugin, config, next) {
    var home = config.blogHome;
    this.config = config;
    this.routes = hapi_routes;
    plugin.route({
        method: 'get',
        path: '/post/{tid}/{tslug}',
        config: {
            handler: this.routes.tumblrRedirect,
            description: '301 redirects for old tumblr blog posts',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: '/rss',
        config: {
            handler: this.routes.rss,
            description: 'rss',
            tags: ['bumble', 'rss']
        }
    });
    plugin.route({
        method: 'get',
        path: home,
        config: {
            handler: this.routes.index,
            description: 'blog index',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: home + '{year}',
        config: {
            handler: this.routes.yearIndex,
            description: 'year index',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: home + '{year}/{month}',
        config: {
            handler: this.routes.monthIndex,
            description: 'month index',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: home + '{year}/{month}/{day}',
        config: {
            handler: this.routes.dayIndex,
            description: 'day index',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: home + '{year}/{month}/{day}/{pslug}',
        config: {
            handler: this.routes.blogPost,
            description: 'blog post',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: '/*',
        config: {
            handler: this.routes.notFound,
            description: '404 page',
            tags: ['bumble', '404']
        }
    });
    //TODO add 404 catchall last
    this.views = new Views(config, next);
};


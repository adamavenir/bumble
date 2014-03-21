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
        this.views.index(req.params.page, function _gotIndex(realPage, context) {
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
        //res.set('Content-Type', 'text/xml');
        reply.view('rss', this.views.rss(), {contentType: 'text/xml'});
    },
    index: function (request, reply) {
        this.views.index(request.query.page, function _gotIndex(realPage, context) {
            if (realPage) {
                return reply().redirect('/?page=' + realPage);
            }
            reply.view('index', context);
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
    //app.get(home, views.index.bind(views));
    //app.get(home + ':year', views.blogYearIndex.bind(views));
    //app.get(home + ':year/:month', views.blogMonthIndex.bind(views));
    //app.get(home + ':year/:month/:day', views.blogDateIndex.bind(views));

    // blog posts
    //app.get(home + ':year/:month/:day/:pslug', views.blogPost.bind(views));

    // home
    //app.get('/', views.index.bind(views));

    // 404
    //app.get('*', views.notFound.bind(views));

};

exports.register = function bumbleHapi(plugin, config, next) {
    var home = config.blogHome;
    this.config = config;
    this.routes = hapi_routes;
    if (home === '/') { home === ''; }
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
    //TODO add 404 catchall last
    this.views = new Views(config, next);
};


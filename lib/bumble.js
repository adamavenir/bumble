var Views       = require('./bumble/views');

exports.express = function bumbleExpress(app, config) {

    //May have to split express and hapi views?
    var views = new Views(config);

    // use jade
    app.set('view engine', 'jade');

    this.app = app;

    // 301 redirects for old tumblr blog posts
    app.get('/post/:tid/:tslug', views.tumblrRedirect.bind(views));

    // rss
    app.get('/rss', views.rss.bind(views));

    var home = config.blogHome;
    if (home === '/') { home === ''; }

    // blog post indexes
    app.get(home, views.index.bind(views));
    // app.get(home + 'blog', views.blogIndex.bind(views));
    app.get(home + ':year', views.blogYearIndex.bind(views));
    app.get(home + ':year/:month', views.blogMonthIndex.bind(views));
    app.get(home + ':year/:month/:day', views.blogDateIndex.bind(views));

    // blog posts
    app.get(home + ':year/:month/:day/:pslug', views.blogPost.bind(views));

    // home
    app.get('/', views.index.bind(views));

    // 404
    app.get('*', views.notFound.bind(views));

};

exports.register = function bumbleHapi(plugin, options, next) {
    var home = options.blogHome;
    var views = new Views(options, 'hapi');
    //TODO route config options
    //TODO Set jade
    if (home === '/') { home === ''; }
    plugin.bind(views);
    plugin.route({
        method: 'get',
        path: '/post/{tid}/{tslug}',
        config: {
            handler: views.tumblrRedirect,
            description: '301 redirects for old tumblr blog posts',
            tags: ['bumble']
        }
    });
    plugin.route({
        method: 'get',
        path: '/rss',
        config: {
            handler: views.rss,
            description: 'rss',
            tags: ['bumble', 'rss']
        }
    });
    next();
};


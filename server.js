var express     = require('express'),
    connect     = require('connect'),
    logger      = require('winston'),
    semiStatic  = require('semi-static'),
    config      = require('./serverapp/useconfig'),
    _           = require('underscore'),
    env         = require('getconfig');

var views       = require('./serverapp/views');

var blogConfig  = config.file('blogConfig.json');

var app = express();

app.configure(function () {
    app.use(express.compress());
    app.use(express['static'](__dirname + '/public'));
    // app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.bodyParser());
});

// use jade
app.set('view engine', 'jade');
// 301 redirects for old tumblr blog posts

app.get('/post/:tid/:tslug', views.tumblrRedirect);

// rss
app.get('/rss', views.rss);

var home = blogConfig.blogHome;
if (home == '/') { home == '' };

// blog post indexes
app.get(home, views.blogIndex);
app.get(home + ':year', views.blogYearIndex);
app.get(home + ':year/:month', views.blogMonthIndex);
app.get(home + ':year/:month/:day', views.blogDateIndex);

// blog posts
app.get(home + ':year/:month/:day/:pslug', views.blogPost);

// TODO
// quotes, talks, links, tools, apps, music, micro

// home
app.get('/', views.index);

// semi-static views
app.get('/*', semiStatic());

// 404
app.get('*', views.notFound);

app.listen(env.http.port);
logger.info('node server running on port: ' + env.http.port);
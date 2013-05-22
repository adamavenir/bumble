var express     = require('express'),
    connect     = require('connect'),
    logger      = require('winston'),
    semiStatic  = require('semi-static'),
    config      = require('getconfig');

var views       = require('./serverapp/views');

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
app.get('/post/:tid/:tslug', function(req, res) {
    var slug = req.params.tslug;
    res.redirect(301, slug)
    logger.info('Request:  ' + config.baseUrl + req.url + '\n>>>>> Redirect: ' + config.baseUrl + '/' + slug)
});

// blog post indexes
app.get('/blog', views.blogIndex);
app.get('/blog/:year', views.blogYearIndex);
app.get('/blog/:year/:month', views.blogMonthIndex);
app.get('/blog/:year/:month/:day', views.blogDateIndex);

// blog posts
app.get('/blog/:pslug', views.blogPost);

// TODO
// quotes, talks, links, tools, apps, music, micro

// app views
app.get('/', views.index);

// semi-static views
app.get('/*', semiStatic());

// 404
app.get('*', views.notFound);

app.listen(config.http.port);
logger.info('node server running on port: ' + config.http.port);
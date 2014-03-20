var util        = require('util');
var logger      = require('bucker').createLogger();
var Views       = require('./bumble/views');

var postData;

function Bumble(app, config) {

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

}

module.exports = Bumble;

var util        = require('util');
var logger      = require('bucker').createLogger();
var Views       = require('./bumble/views');

var postData;

function Bumble (app, config) {

  var views = new Views(config);

  // use jade
  app.set('view engine', 'jade');

  this.app = app;

  // 301 redirects for old tumblr blog posts
  app.get('/post/:tid/:tslug', views.tumblrRedirect(config));

  // rss
  app.get('/rss', views.rss);

  var home = config.blogHome;
  if (home == '/') { home == '' };

  // blog post indexes
  app.get(home, views.index);
  app.get(home + 'blog', views.blogIndex(config));
  app.get(home + ':year', views.blogYearIndex(config));
  app.get(home + ':year/:month', views.blogMonthIndex(config));
  app.get(home + ':year/:month/:day', views.blogDateIndex(config));

  // blog posts
  app.get(home + ':year/:month/:day/:pslug', views.blogPost(config));

  // home
  app.get('/', views.index(config));

  // 404
  app.get('*', views.notFound(config));

};

module.exports = function (app, config) {
  return Bumble(app, config);
  logger.debug('config passed in bumble.js: ' + util.inspect(config));
}

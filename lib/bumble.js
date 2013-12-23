
function Bumble (app, config) {
  this.app = app;
  app.get('/', function(req, res) {
    res.send('hey hey ' + config.blogTitle);
  });
  app.get('/blog', function(req, res) {
    res.send('hey hey bumble blog title is ' + config.blogTitle);
  });
};

module.exports = function (app, config) {
  return new Bumble(app, config);
}
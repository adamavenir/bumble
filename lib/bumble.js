function Bumble (app, options) {
  this.app = app;
  app.get('/', function(req, res) {
    res.send('hey hey bumble');
  });
  app.get('/blog', function(req, res) {
    res.send('hey hey bumble blog');
  });
};

module.exports = function (app, options) {
  return new Bumble(app, options);
}
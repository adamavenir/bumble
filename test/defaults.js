/* Test that the handlers return expected data */
var server;
var Lab = require('lab');
var Hapi = require('hapi');
var blogConfig = require('./testConfig.json');

Lab.experiment('default happy path tests', function () {
    Lab.before(function (done) {
        server = new Hapi.Server('localhost', 3001, { views: { engines: { jade: 'jade' }, path: './example/views' } });
        server.pack.require({'..': blogConfig}, function _packRequired(err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    });
    Lab.test('tumblr redirect', function (done) {
        server.inject({
            method: 'get',
            url: '/post/xj9000/another-post-goes-here'
        }, function _getPost(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(301);
            Lab.expect(res.headers.location, 'redirect location').to.equal('http://localhost:3001/2011/06/04/another-post-goes-here');
            done();
        });
    });
    Lab.test('404 page', function (done) {
        server.inject({
            method: 'get',
            url: '/1999/12/31/prince-party'
        }, function _getInvalidPost(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(404);
            Lab.expect(res.payload, 'response body').to.equal('<h1>404</h1>');
            done();
        });
    });
});

/* Test that the handlers return expected data */
var server;
var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');
var blogConfig = require('./testConfig.json');
var Bumble = require('..');
var Jade = require('jade');

var viewOptions = {
    engines: {
        jade: Jade
    },
    isCached: false,
    path: 'example/views'
};

lab.experiment('default tests', function () {
    lab.before(function (done) {
        server = new Hapi.Server();
        server.connection();
        server.views(viewOptions);

        server.register([{
            register: Bumble,
            options: blogConfig
        }], function _packRegistered(err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    });
    lab.test('successful tumblr redirect', function (done) {
        server.inject({
            method: 'get',
            url: '/post/xj9000/another-post-goes-here'
        }, function _getPost(res) {
            Code.expect(res.statusCode, 'response code').to.equal(301);
            Code.expect(res.headers.location, 'redirect location').to.equal('/2011/06/04/another-post-goes-here');
            done();
        });
    });
    lab.test('missing tumblr redirect', function (done) {
        server.inject({
            method: 'get',
            url: '/post/xj9000/another-post-was-here'
        }, function _getPost(res) {
            Code.expect(res.statusCode, 'response code').to.equal(404);
            done();
        });
    });
    lab.test('404 page', function (done) {
        server.inject({
            method: 'get',
            url: '/1999/12/31/prince-party'
        }, function _getInvalidPost(res) {
            Code.expect(res.statusCode, 'response code').to.equal(404);
            Code.expect(res.payload, 'response body').to.equal('<!DOCTYPE html><head><body id=\"fourohfour\"><h1>404</h1></body></head>');
            done();
        });
    });
    lab.test('page redirect', function (done) {
        server.inject({
            method: 'get',
            url: '/?page=5'
        }, function _getPage5(res) {
            Code.expect(res.statusCode, 'response code').to.equal(302);
            Code.expect(res.headers.location, 'redirect location').to.equal('/?page=1');
            done();
        });
    });
    lab.test('rss page', function (done) {
        server.inject({
            method: 'get',
            url: '/rss',
        }, function _getRss(res) {
            Code.expect(res.statusCode, 'response code').to.equal(200);
            //There is probably a better way to test content type
            Code.expect(res.headers['content-type'], 'response content type').to.equal('text/xml; charset=utf-8');
            //TODO parse rss
            done();
        });
    });
    lab.test('actual blog post', function (done) {
        server.inject({
            method: 'get',
            url: '/2011/06/04/another-post-goes-here'
        }, function _getBlogPost(res) {
            Code.expect(res.statusCode, 'response code').to.equal(200);
            //TODO parse content
            done();
        });
    });
    lab.test('year summary', function (done) {
        server.inject({
            method: 'get',
            url: '/2011'
        }, function _yearSummary(res) {
            Code.expect(res.statusCode, 'response code').to.equal(200);
            //TODO parse content
            done();
        });
    });
    lab.test('tag index', function (done) {
        server.inject({
            method: 'get',
            url: '/tag/sample'
        }, function _tagIndex(res) {
            Code.expect(res.statusCode, 'response code').to.equal(200);
            //TODO parse content
            done();
        });
    });
    lab.test('author index', function (done) {
        server.inject({
            method: 'get',
            url: '/author/testy-mctester'
        }, function _authorIndex(res) {
            Code.expect(res.statusCode, 'response code').to.equal(200);
            //TODO parse content
            done();
        });
    });
});

var logger      = require('bucker').createLogger();
var marked      = require('marked');
var sugar       = require('sugar');
var jf          = require('jsonfile');
var util        = require('util');
var gravatar    = require('gravatar')
var fs          = require('fs')
var paginator   = require('./paginator');
var _           = require('underscore');
var ParsePosts  = require('./ParsePosts');

function Views (config) {

    var self = this;

    var parsePosts  = new ParsePosts(config);

    var postData;

    // go get a gravatar
    gravatar = gravatar.url(config.blogAuthorEmail, 100);

    function loadPosts(posts) {
        logger.info('starting loadPost');
        self.postData = posts.sort(function (a, b) {
            return (b.date - a.date);
        });
        self.postSetData = _.first(posts, [config.maxPosts]);
        logger.info('posts: ', util.inspect(self.postSetData));
    };

    // parse and load the post files into memory
    parsePosts.on('ready', function (posts, config) {
        logger.info('parsePosts ready');
        loadPosts(posts);
    });

    parsePosts.on('update', function (posts, config) {
        logger.info('parsePosts update');
        loadPosts(posts);
    });

    parsePosts.setup(config);

};

Views.prototype.tumblrRedirect = function (req, res) {
    // logger.info('req.params.tslug: ' + req.params.tslug);
    // logger.info('thisPost: ' + _.findWhere(postData, {slug: req.params.tslug }).url);
    res.redirect(301, _.findWhere(this.postData, {slug: req.params.tslug }).url);
    // logger.debug('Request:  ' + req.url + '\n>>>>> Redirect: ' + _.findWhere(postData, {slug: req.params.tslug }).url);
};

Views.prototype.index = function (req, res) {
    // logger.info(config.blogTitle);
    paginator.paginate(this.postData, req, res, function (realPage) {
        if (realPage) return res.redirect('/?page=' + realPage);
        res.render('index', { 
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            bodyId: 'archive',
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            blogAuthor: config.blogAuthor,
            blogAuthorEmail: config.blogAuthorEmail,
            gravatar: this.gravatar,
            blogBio: config.blogBio,
            rssUrl: config.rssUrl
        });
    });
};

Views.prototype.blogIndex = function (req, res) {
    // logger.info(config.blogTitle);
    paginator.paginate(this.postData, req, res, function (realPage) {
        if (realPage) return res.redirect('/?page=' + realPage);
        res.render('blogIndex', { 
            pageTitle: 'Blog posts', 
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            bodyId: 'archive',
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            blogAuthor: config.blogAuthor,
            blogAuthorEmail: config.blogAuthorEmail,
            gravatar: this.gravatar,
            blogBio: config.blogBio,
            rssUrl: config.rssUrl
        });
    });
};

// rss
Views.prototype.rss = function (req, res) {
    res.set('Content-Type', 'text/xml');
    res.render('rss', {
        postData: this.postSetData,
    });
}; 


Views.prototype.blogYearIndex = function (req, res) {
    var year  = req.params.year,
        month = req.params.month,
        day   = req.params.day,
        posts = new Array();

    for (var i = 0; i < this.postData.length; i++) {
        var postYear = Date.create(this.postData[i].date).format('{yyyy}');

        if (postYear == year) {
            posts.push(this.postData[i]);
        }
    };

    paginator.paginate(posts, req, res, function (realPage) {
        if (realPage) return res.redirect('/' + year + '/?page=' + realPage);
        res.render('blogIndex', { 
            pageTitle: 'All of ' + year, 
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            bodyId: 'archive',
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            blogAuthor: config.blogAuthor,
            blogAuthorEmail: config.blogAuthorEmail,
            gravatar: this.gravatar,
            blogBio: config.blogBio,
            rssUrl: config.rssUrl
        });
    });
};

Views.prototype.blogMonthIndex = function (req, res) {
    var year  = req.params.year,
        month = req.params.month,
        posts = new Array();

    for (var i = 0; i < this.postData.length; i++) {
        var postYear = Date.create(this.postData[i].date).format('{yyyy}');
        var postMonth = Date.create(this.postData[i].date).format('{MM}');

        if (postYear == year && postMonth == month) {
            // logger.info('dates match for ' + this.postData[i].title)
            posts.push(this.postData[i]);
        }
        else
            logger.info('No match — year: ' + postYear + " (" + year + ") | month: " + postMonth + " (" + month + ")");
    };

    paginator.paginate(posts, req, res, function (realPage) {
        if (realPage) return res.redirect('/' + year + '/' + month + '/?page=' + realPage);

        res.render('blogIndex', { 
            pageTitle: 'All of ' + Date.create(month + '-' + year).format('{Month}, {yyyy}'),
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            bodyId: 'archive',
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            blogAuthor: config.blogAuthor,
            blogAuthorEmail: config.blogAuthorEmail,
            gravatar: this.gravatar,
            blogBio: config.blogBio,
            rssUrl: config.rssUrl 
        });
    });
};


Views.prototype.blogDateIndex = function (req, res) {
    var year  = req.params.year,
        month = req.params.month,
        day   = req.params.day,
        posts = new Array();

    for (var i = 0; i < this.postData.length; i++) {
        var postYear = Date.create(this.postData[i].date).format('{yyyy}');
        var postMonth = Date.create(this.postData[i].date).format('{MM}');
        var postDay = Date.create(this.postData[i].date).format('{dd}');

        if (postYear == year && postMonth == month && postDay == day) {
            posts.push(this.postData[i]);
        }
    };

    paginator.paginate(posts, req, res, function (realPage) {
        if (realPage) return res.redirect('/' + year + '/' + month + '/' + day + '/?page=' + realPage);

        res.render('blogIndex', { 
            pageTitle: Date.create(year + '-' + month + '-' + day).format('{Month} {d}, {yyyy}'), 
            bodyId: 'archive',
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            blogAuthor: config.blogAuthor,
            blogAuthorEmail: config.blogAuthorEmail,
            gravatar: this.gravatar,
            blogBio: config.blogBio,
            rssUrl: config.rssUrl
        });
    });
};

Views.prototype.blogPost = function (req, res) {
    var slug = req.params.pslug,
        year  = req.params.year,
        month = req.params.month,
        day   = req.params.day;

    var thisSlug = year + '-' + month + '-' + day + '-' + slug;
    var thisPost = _.findWhere(this.postData, {fullSlug: thisSlug });

    res.render('post', {
        pageTitle: thisPost.title,
        blogTitle: config.blogTitle,
        blogSubtitle: config.blogSubtitle,
        blogAuthor: config.blogAuthor,
        blogAuthorEmail: config.blogAuthorEmail,
        gravatar: this.gravatar,
        blogBio: config.blogBio,
        rssUrl: config.rssUrl,
        bodyId: 'post',
        slug: slug,
        title: thisPost.title,
        date: thisPost.formattedDate,
        author: thisPost.author,
        content: thisPost.postBody,
        type: thisPost.type
    });
};

// 404
Views.prototype.notFound = function (req, res) {
    res.render('404', {status: 404, bodyId: 'fourohfour'});
};


module.exports = Views;
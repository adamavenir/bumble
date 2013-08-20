var env      = require('getconfig'),
    logger   = require('bucker').createLogger(env.bucker, module),
    marked   = require('marked'),
    sugar    = require('sugar'),
    jf       = require('jsonfile'),
    util     = require('util'),
    gravatar = require('gravatar'),
    fs       = require('fs'),
    _        = require('underscore'),
    config   = require('../serverapp/useconfig').file('blogConfig.json'),
    paginator = require('./paginator');

var parsePosts  = new (require('./ParsePost'))(),
    postData;

// go get a gravatar
gravatar = gravatar.url(config.blogAuthorEmail, 100);

function loadPosts(posts) {
    postData = posts.sort(function (a, b) {
        return (b.date - a.date);
    });
    postSetData = _.first(posts, [config.maxPosts]);
};

// parse and load the post files into memory
parsePosts.on('ready', function (posts) {
    loadPosts(posts);
});

parsePosts.on('update', function (posts) {
    loadPosts(posts);
});

parsePosts.setup();

// homepage
exports.index = function (req, res) {
    res.render('index', {
        pageTitle: 'home', 
        bodyId: 'home'
    });
}; 

exports.tumblrRedirect = function(req, res) {
    var slug = req.params.tslug;
    var thisPost = _.findWhere(postData, {fullSlug: slug });
    res.redirect(301, thisPost.permalink);
    logger.info(thisPost.permalink);
    logger.info('Request:  ' + req.url + '\n>>>>> Redirect: ' + slug);
};

exports.blogIndex = function (req, res) {
    // logger.info(config.blogTitle);
    paginator.paginate(postData, req, res, function (realPage) {
        if (realPage) return res.redirect('/?page=' + realPage);
        res.render('blogIndex', { 
            pageTitle: 'All posts', 
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            bodyId: 'archive',
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            blogAuthor: config.blogAuthor,
            gravatar: gravatar,
            blogBio: config.blogBio
        });
    });
};

// rss
exports.rss = function (req, res) {
    res.set('Content-Type', 'text/xml');
    res.render('rss', {
        postData: postSetData,
    });
}; 


exports.blogYearIndex = function (req, res) {
    var year  = req.params.year,
        month = req.params.month,
        day   = req.params.day,
        posts = new Array();

    for (var i = 0; i < postData.length; i++) {
        var postYear = Date.create(postData[i].date).format('{yyyy}');

        if (postYear == year) {
            posts.push(postData[i]);
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
            gravatar: gravatar,
            blogBio: config.blogBio
        });
    });
};

exports.blogMonthIndex = function (req, res) {
    var year  = req.params.year,
        month = req.params.month,
        posts = new Array();

    for (var i = 0; i < postData.length; i++) {
        var postYear = Date.create(postData[i].date).format('{yyyy}');
        var postMonth = Date.create(postData[i].date).format('{MM}');

        if (postYear == year && postMonth == month) {
            logger.info('dates match for ' + postData[i].title)
            posts.push(postData[i]);
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
            gravatar: gravatar,
            blogBio: config.blogBio    
        });
    });
};


exports.blogDateIndex = function (req, res) {
    var year  = req.params.year,
        month = req.params.month,
        day   = req.params.day,
        posts = new Array();

    for (var i = 0; i < postData.length; i++) {
        var postYear = Date.create(postData[i].date).format('{yyyy}');
        var postMonth = Date.create(postData[i].date).format('{MM}');
        var postDay = Date.create(postData[i].date).format('{dd}');

        if (postYear == year && postMonth == month && postDay == day) {
            posts.push(postData[i]);
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
            gravatar: gravatar,
            blogBio: config.blogBio
        });
    });
};

exports.blogPost = function (req, res) {
    var slug = req.params.pslug,
        year  = req.params.year,
        month = req.params.month,
        day   = req.params.day;

    var thisSlug = year + '-' + month + '-' + day + '-' + slug;
    var thisPost = _.findWhere(postData, {fullSlug: thisSlug });

    res.render('post', {
        pageTitle: thisPost.title,
        blogTitle: config.blogTitle,
        blogSubtitle: config.blogSubtitle,
        blogAuthor: config.blogAuthor,
        gravatar: gravatar,
        blogBio: config.blogBio,
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
exports.notFound = function (req, res) {
    res.render('404', {status: 404, bodyId: 'fourohfour'});
};

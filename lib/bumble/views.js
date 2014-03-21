var paginator   = require('./paginator');
var _           = require('underscore');
var ParsePosts  = require('./ParsePosts');

//Express views
function Views(config, done) {

    var self = this;
    var parsePosts  = new ParsePosts();

    this.config = config;

    function loadPosts(posts) {
        self.postData = _.sortBy(posts, 'date');
        self.postSetData = _.first(posts, config.maxPosts);
    }

    // parse and load the post files into memory
    parsePosts.on('ready', function (posts) {
        loadPosts(posts);
        done();
    });

    parsePosts.on('update', function (posts) {
        loadPosts(posts);
    });

    parsePosts.setup(config);

}

Views.prototype.tumblrRedirect = function (params) {
    var context;
    var post = _.findWhere(this.postData, {slug: params.tslug });
    if (post) {
        context = post.url;
    }
    return context;
};

// rss
Views.prototype.rss = function () {
    var context = {postData: this.postSetData};
    return context;
};

Views.prototype.blogIndex = function (currentPage, next) {
    var self = this;

    paginator.paginate(this.postData, this.config.maxPosts, currentPage, function (realPage, context) {
        if (realPage) {
            return next(realPage);
        }
        context.blogSubtitle = self.postData[0].blogSubtitle;
        context.bodyId = 'archive';
        context.blogTitle = self.postData[0].blogTitle;
        context.blogAuthor = self.postData[0].blogAuthor;
        context.blogAuthorEmail = self.postData[0].blogAuthorEmail;
        context.gravatar = self.postData[0].gravatar;
        context.blogBio = self.postData[0].blogBio;
        context.rssUrl = self.postData[0].rssUrl;
        next(false, context);
    });
};

Views.prototype.blogYearIndex = function (currentPage, year, next) {
    var self = this;

    var posts = this.postData.filter(function _thisYear(post) {
        var postYear = Date.create(post.date).format('{yyyy}');
        return postYear === year;
    });

    paginator.paginate(posts, this.config.maxPosts, currentPage, function (realPage, context) {
        if (realPage) {
            return next(realPage);
        }
        context.pageTitle = 'All of ' + year;
        context.blogSubtitle = self.postData[0].blogSubtitle;
        context.bodyId = 'archive';
        context.blogTitle = self.postData[0].blogTitle;
        context.blogAuthor = self.postData[0].blogAuthor;
        context.blogAuthorEmail = self.postData[0].blogAuthorEmail;
        context.gravatar = self.postData[0].gravatar;
        context.blogBio = self.postData[0].blogBio;
        context.rssUrl = self.postData[0].rssUrl;
        next(false, context);
    });
};

Views.prototype.blogMonthIndex = function (currentPage, year, month, next) {
    var self = this;

    var posts = this.postData.filter(function _thisMonth(post) {
        var postYear = Date.create(post.date).format('{yyyy}');
        var postMonth = Date.create(post.date).format('{MM}');
        return postYear === year && postMonth === month;
    });

    paginator.paginate(posts, this.config.maxPosts, currentPage, function (realPage, context) {
        if (realPage) {
            return next(realPage);
        }
        context.pageTitle = 'All of ' + year;
        context.blogSubtitle = self.postData[0].blogSubtitle;
        context.bodyId = 'archive';
        context.blogTitle = self.postData[0].blogTitle;
        context.blogAuthor = self.postData[0].blogAuthor;
        context.blogAuthorEmail = self.postData[0].blogAuthorEmail;
        context.gravatar = self.postData[0].gravatar;
        context.blogBio = self.postData[0].blogBio;
        context.rssUrl = self.postData[0].rssUrl;
        next(false, context);
    });
};


Views.prototype.blogDayIndex = function (currentPage, year, month, day, next) {
    var self = this;

    var posts = this.postData.filter(function _thisMonth(post) {
        var postYear = Date.create(post.date).format('{yyyy}');
        var postMonth = Date.create(post.date).format('{MM}');
        var postDay = Date.create(post.date).format('{dd}');

        return postYear == year && postMonth == month && postDay == day;
    });


    paginator.paginate(posts, this.config.maxPosts, currentPage, function (realPage, context) {
        if (realPage) {
            return next(realPage);
        }
        context.pageTitle = 'All of ' + year;
        context.blogSubtitle = self.postData[0].blogSubtitle;
        context.bodyId = 'archive';
        context.blogTitle = self.postData[0].blogTitle;
        context.blogAuthor = self.postData[0].blogAuthor;
        context.blogAuthorEmail = self.postData[0].blogAuthorEmail;
        context.gravatar = self.postData[0].gravatar;
        context.blogBio = self.postData[0].blogBio;
        context.rssUrl = self.postData[0].rssUrl;
        next(false, context);
    });
};

Views.prototype.blogPost = function (year, month, day, slug, next) {
    var context;
    var thisSlug = [year, month, day, slug].join('-');
    var thisPost = _.findWhere(this.postData, {fullSlug: thisSlug });

    if (thisPost) {
        context = {
            pageTitle: thisPost.title,
            blogTitle: thisPost.blogTitle,
            blogSubtitle: thisPost.blogSubtitle,
            blogAuthor: thisPost.blogAuthor,
            blogAuthorEmail: thisPost.blogAuthorEmail,
            gravatar: thisPost.gravatar,
            blogBio: thisPost.blogBio,
            rssUrl: thisPost.rssUrl,
            bodyId: 'post',
            slug: slug,
            title: thisPost.title,
            date: thisPost.formattedDate,
            author: thisPost.author,
            content: thisPost.postBody,
            type: thisPost.type
        };
    }
    return next(context);
};

module.exports = Views;

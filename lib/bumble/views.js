var paginator   = require('./paginator');
var _           = require('underscore');
var ParsePosts  = require('./ParsePosts');

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

//Displays index of blog optionally limited by date elements
Views.prototype.blogIndex = function (currentPage, dateParts, next) {
    var posts;
    var self = this;
    if (dateParts === '') {
        dateParts = [];
    }
    posts = this.postData.filter(function _filterPosts(post) {
        if (dateParts[0] && Date.create(post.date).format('{yyyy}') !== dateParts[0]) {
            return false;
        }
        if (dateParts[1] && Date.create(post.date).format('{MM}') !== dateParts[1]) {
            return false;
        }
        if (dateParts[2] && Date.create(post.date).format('{dd}') !== dateParts[2]) {
            return false;
        }
        return true;
    });

    paginator.paginate(posts, this.config.maxPosts, currentPage, function (realPage, context) {
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

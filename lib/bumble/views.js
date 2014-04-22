var paginator   = require('./paginator');
var _           = require('underscore');
var ParsePosts  = require('./ParsePosts');

function Views(config, done) {

    var self = this;
    var parsePosts  = new ParsePosts();

    self.config = config;

    function loadPosts(posts) {
        self.postData = _.sortBy(posts, 'date').reverse();
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

    paginator.paginate(posts, this.config.maxPosts, currentPage, next);
};

Views.prototype.tagIndex = function (currentPage, tag, multiple, next) {
    var posts;
    posts = this.postData.filter(function _filterPosts(post) {
        if (multiple) {
            return _.intersection(post.tags, tag.split('/')).length > 0;
        }
        return post.tags.indexOf(tag.split('/')[0]) > -1;
    });

    paginator.paginate(posts, this.config.maxPosts, currentPage, next);
};

Views.prototype.authorIndex = function (currentPage, authorSlug, multiple, next) {
    var posts;

    if (multiple) {
        posts = _.filter(this.postData, function (post) {
            return authorSlug.split('/').indexOf(post.authorSlug) > -1;
        });
    } else {
        posts = _.where(this.postData, {authorSlug: authorSlug.split('/')[0]});
    }

    paginator.paginate(posts, this.config.maxPosts, currentPage, next);
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
            authorSlug: thisPost.authorSlug,
            content: thisPost.postBody,
            tagMap: thisPost.tagMap,
            tagCount: Object.keys(thisPost.tagMap).length,
            lastTag: thisPost.lastTag,
            type: thisPost.type
        };
    }
    return next(context);
};

module.exports = Views;

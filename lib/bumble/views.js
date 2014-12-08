var paginator   = require('./paginator');
var _           = require('underscore');
var ParsePosts  = require('./ParsePosts');
var gravatar = require('gravatar');

function Views(config, done) {

    var self = this;
    var parsePosts  = new ParsePosts();

    self.config = config;

    self.blogContext = _.pick(config, 'blogAuthor', 'blogAuthorEmail', 'blogTitle', 'blogSubtitle', 'blogBio', 'siteUrl', 'rssUrl', 'maxPosts');
    _.defaults(self.blogContext, {blogAuthorGravatar: gravatar.url(self.blogContext.blogAuthorEmail)});

    function loadPosts(posts) {
        self.postData = _.sortBy(posts, 'date').reverse();
        self.postSetData = _.first(self.postData, config.maxPosts);
        self.tagMap = {};
        self.authorMap = {};
        self.archives = {};

        self.api = {};
        self.api.latestPosts = [];

        _.each(self.postData, function (post) {
            var thisPost = _.pick(post, ['date', 'title', 'permalink', 'author', 'authorSlug', 'authorGravatar', ]);
            self.api.latestPosts.push(thisPost);
        });

        self.api.latestPosts = _.first(self.api.latestPosts, 10);

        _.chain(posts).pluck('tagMap').each(function (tagMap) { _.extend(this, tagMap); }, self.tagMap);

        _.each(posts, function (thisPost) {
            thisPost.matchTags = [];

            // iterate through all posts for each post
            self.postData.forEach(function (post) {
                post.tags.forEach(function (tag) {
                    // determine if tags from thisPost match tags from post
                    if (_.contains(thisPost.tags, tag) && thisPost.permalink != post.permalink && !_.contains(thisPost.matchTags, post)) {
                        // add all post data to this post's matchTags array
                        thisPost.matchTags.push(post);
                    }
                });
            });

            var year = thisPost.date.format('{yyyy}');
            self.authorMap[thisPost.authorSlug] = thisPost.author;
            if (!self.archives[year]) { self.archives[year] = []; }
            self.archives[year].push(thisPost.date.format('{Month}'));
            self.archives[year] = _.uniq(self.archives[year]);
        });
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
    return _.extend(context, this.blogContext);
};

//Displays index of blog optionally limited by date elements
Views.prototype.blogIndex = function (currentPage, datePart, next) {
    var dateParts = datePart ? datePart.split('/') : [];
    var posts = this.postData.filter(function _filterPosts(post) {
        if (dateParts[0] && Date.create(post.date).format('{yyyy}') !== dateParts[0]) {
            return false;
        }
        if (dateParts[1]) {
            if ([
                Date.create(post.date).format('{MM}'),
                Date.create(post.date).format('{Month}'),
                Date.create(post.date).format('{month}')
            ].indexOf(dateParts[1]) === -1) {
                return false;
            }
        }
        if (dateParts[2] && Date.create(post.date).format('{dd}') !== dateParts[2]) {
            return false;
        }
        return true;
    });

    paginator.paginate(this.blogContext, posts, currentPage, next);
};

Views.prototype.tagIndex = function (currentPage, tag, multiple, next) {
    var tags = tag ? tag.split('/') : [];

    var posts = this.postData.filter(function _filterPosts(post) {
        if (multiple) {
            return _.intersection(post.tags, tags).length > 0;
        }
        return post.tags.indexOf(tags[0]) > -1;
    });

    paginator.paginate(this.blogContext, posts, currentPage, next);
};

Views.prototype.authorIndex = function (currentPage, authorSlug, multiple, next) {
    var authorSlugs = authorSlug ? authorSlug.split('/') : [];

    var posts = this.postData.filter(function _filterPosts(post) {
        if (multiple) {
            return authorSlugs.indexOf(post.authorSlug) > -1;
        }
        return post.authorSlug === authorSlugs[0];
    });

    paginator.paginate(this.blogContext, posts, currentPage, next);
};

Views.prototype.blogPost = function (year, month, day, slug, next) {
    var context, relatedPosts;
    var config = this.config;
    var thisSlug = [year, month, day, slug].join('-');
    var thisPost = _.findWhere(this.postData, {fullSlug: thisSlug });

    //this should be done already?
    //tagCount: Object.keys(thisPost.tagMap).length,
    //lastTag: thisPost.lastTag,

    if (thisPost) {
        
        if (config.randomRelated) {
            relatedPosts = _.first(_.shuffle(thisPost.matchTags), config.maxRelated);
        }
        if (!config.randomRelated) {
            relatedPosts = _.first(thisPost.matchTags, config.maxRelated);
        }

        context = _.extend({
            bodyId: 'post',
            pageTitle: thisPost.title,
            postData: thisPost,
            relatedPosts: relatedPosts,
        }, this.blogContext);
        // console.log('context', context);
    }
    return next(false, context);
};



// API

//Displays index of blog optionally limited by date elements
Views.prototype.latestPostsAPI = function (next) {
    // var maxPosts = this.config.maxPosts;

    // var posts = _.each(this.postData, function(post) {
    //                 // console.log(post.postBody);
    //                 _.omit(post, "postBody");
    //                 console.log(post);
    //              })
    // // var posts = _.omit(this.postData, [this.postData.postBody, this.postData.introBody, this.postData.tagMap, this.postData.matchTags]);
    // // var posts = _.omit(this.postData, "post.postBody");
    // // console.log(posts);
    //              // .first(maxPosts)
    //              // .value();
    // // var posts = _.chain(this.postData).first(maxPosts).omit()
    // // var posts = _.first(this.postData, maxPosts);
    // // var posts = _.omit(posts, [posts.matchTags, posts.tagMap, posts.postBody]);

    // var apiData = {
    //     context: this.blogContext,
    //     posts: posts
    // };
    console.log(_.first(this.api.latestPosts));

    return next(false, this.api.latestPosts);
};



module.exports = Views;

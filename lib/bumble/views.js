/*jshint eqnull:true */
var contains = require('amp-contains');
var defaults = require('amp-defaults');
var each = require('amp-each');
var extend = require('amp-extend');
var find = require('amp-find');
var first = require('amp-first');
var flatten = require('amp-flatten');
var gravatar = require('gravatar');
var pick = require('amp-pick');
var pluck = require('amp-pluck');
var shuffle = require('amp-shuffle');
var unique = require('amp-unique');
var ParsePosts  = require('./ParsePosts');
var paginator = require('./paginator');

//TODO submit this as amp-intersection
var intersection = function (array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
        var item = array[i];
        if (contains(result, item)) continue;
        for (var j = 1; j < argsLength; j++) {
            if (!contains(arguments[j], item)) break;
        }
        if (j === argsLength) result.push(item);
    }
    return result;
};

function Views(config, done) {

    var self = this;
    var parsePosts  = new ParsePosts();

    self.config = config;

    self.blogContext = pick(config, 'blogAuthor', 'blogAuthorEmail', 'blogTitle', 'blogSubtitle', 'blogBio', 'siteUrl', 'rssUrl', 'maxPosts');
    defaults(self.blogContext, {blogAuthorGravatar: gravatar.url(self.blogContext.blogAuthorEmail)});

    function loadPosts(posts) {
        self.postData = posts.sort(function (a, b) { return a.date - b.date; }).reverse();
        self.postSetData = first(self.postData, config.maxPosts);
        self.tagMap = {};
        self.authorMap = {};
        self.archives = {};

        self.api = {};

        each(pluck(posts, 'tagMap'), function (tagMap) { extend(this, tagMap); }, self.tagMap);

        each(posts, function (thisPost) {

            var year = thisPost.date.format('{yyyy}');
            thisPost.evergreenRelated = [];
            thisPost.allRelated = [];

            each(self.postData, function (post) {
                // add only evergreen post data to evergreenRelated
                if (intersection(thisPost.tags, post.tags).length > 0 && post.permalink !== thisPost.permalink && post.evergreen) {
                    thisPost.evergreenRelated.push(pick(post, ['date', 'title', 'url', 'permalink', 'author', 'authorSlug']));
                }
                // add all posts without "stale: true" to allRelated
                if (intersection(thisPost.tags, post.tags).length > 0 && post.permalink !== thisPost.permalink && !post.stale) {
                    thisPost.allRelated.push(pick(post, ['date', 'title', 'url', 'permalink', 'author', 'authorSlug']));
                }
            });

            self.authorMap[thisPost.authorSlug] = thisPost.author;
            if (!self.archives[year]) { self.archives[year] = []; }
            self.archives[year].push(thisPost.date.format('{Month}'));
            self.archives[year] = unique(self.archives[year]);
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
    var post = find(this.postData, {slug: params.tslug });
    if (post) {
        context = post.url;
    }
    return context;
};

// rss
Views.prototype.rss = function () {
    var context = {postData: this.postSetData};
    return extend(context, this.blogContext);
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
            return intersection(post.tags, tags).length > 0;
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
    var context, relatedSet, subset;
    var config = this.config;
    var thisSlug = [year, month, day, slug].join('-');
    var thisPost = find(this.postData, {fullSlug: thisSlug });

    if (thisPost) {

        var evergreen = thisPost.evergreenRelated;
        var allRelated = thisPost.allRelated;

        if (evergreen.length >= config.maxRelated) {
            if (config.randomRelated) {
                relatedSet = flatten(first(shuffle(evergreen), config.maxRelated));
            }
            else {
                relatedSet = flatten(first(evergreen, config.maxRelated));
            }
        }

        else {
            var max = config.maxRelated - evergreen.length;
            if (config.randomRelated) {
                subset = first(shuffle(allRelated), max);
                relatedSet = unique(flatten(evergreen, subset));
            }
            else {
                subset = first(allRelated, max);
                relatedSet = flatten(unique(evergreen, subset));
            }
        }

        context = extend({
            bodyId: 'post',
            pageTitle: thisPost.title,
            postData: thisPost,
            relatedPosts: relatedSet,
        }, this.blogContext);
    }
    return next(false, context);
};

module.exports = Views;

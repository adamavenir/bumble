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
        _.chain(posts).pluck('tagMap').each(function (tagMap) { _.extend(this, tagMap); }, self.tagMap);
        _.each(posts, function (post) {
            var year = post.date.format('{yyyy}');
            self.authorMap[post.authorSlug] = post.author;
            if (!self.archives[year]) { self.archives[year] = []; }
            self.archives[year].push(post.date.format('{Month}'));
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
    var context;
    var thisSlug = [year, month, day, slug].join('-');
    var thisPost = _.findWhere(this.postData, {fullSlug: thisSlug });

    context = _.extend({
        allTags:  _.uniq(_.flatten(_.pluck(this.postData, 'tags')))
    });

    // console.log(context.allTags)

    var matchTags = [];

    this.postData.forEach(function (post) {
      //console.log('======== ' + post.title + ' ========');
        post.tags.forEach(function (tag) {
            if (_.contains(thisPost.tags, tag) && thisPost.permalink != post.permalink) {
                matchTags.push(post);
                //console.log('PUSHED:  ' + post.title + ' with tag ' + tag);
            }
            // else {
            //     console.log('IGNORED: ' + post.title + ' with tag ' + tag);
            // }
        });
    });

    //this should be done already?
    //tagCount: Object.keys(thisPost.tagMap).length,
    //lastTag: thisPost.lastTag,

    if (thisPost) {
        context = _.extend({
            bodyId: 'post',
            pageTitle: thisPost.title,
            postData: thisPost,
            matchTags: matchTags,
        }, this.blogContext);
        // console.log('context', context);
    }
    return next(false, context);
};

module.exports = Views;

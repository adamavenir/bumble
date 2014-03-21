var logger      = require('bucker').createLogger();
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

Views.prototype.index = function (currentPage, next) {
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

//Views.prototype.blogIndex = function (req, res) {

    //var self = this;

    //paginator.paginate(this.postData, this.postData[0].maxPosts, req, res, function (realPage) {
        //if (realPage) return res.redirect('/?page=' + realPage);
        //res.render('blogIndex', {
            //pageTitle: 'Blog posts',
            //blogSubtitle: self.postData[0].blogSubtitle,
            //bodyId: 'archive',
            //blogTitle: self.postData[0].blogTitle,
            //blogAuthor: self.postData[0].blogAuthor,
            //blogAuthorEmail: self.postData[0].blogAuthorEmail,
            //gravatar: self.postData[0].gravatar,
            //blogBio: self.postData[0].blogBio,
            //rssUrl: self.postData[0].rssUrl
        //});
    //});
//};


//Views.prototype.blogYearIndex = function (req, res) {

    //var self = this;

    //var year  = req.params.year,
        //posts = [];

    //for (var i = 0; i < this.postData.length; i++) {
        //var postYear = Date.create(this.postData[i].date).format('{yyyy}');

        //if (postYear == year) {
            //posts.push(this.postData[i]);
        //}
    //}

    //paginator.paginate(posts, self.postData[0].maxPosts, req, res, function (realPage) {
        //if (realPage) return res.redirect('/' + year + '/?page=' + realPage);
        //res.render('blogIndex', {
            //pageTitle: 'All of ' + year,
            //blogSubtitle: self.postData[0].blogSubtitle,
            //bodyId: 'archive',
            //blogTitle: self.postData[0].blogTitle,
            //blogAuthor: self.postData[0].blogAuthor,
            //blogAuthorEmail: self.postData[0].blogAuthorEmail,
            //gravatar: self.postData[0].gravatar,
            //blogBio: self.postData[0].blogBio,
            //rssUrl: self.postData[0].rssUrl
        //});
    //});
//};

//Views.prototype.blogMonthIndex = function (req, res) {
    //logger.info('views.blogMonthIndex');

    //var self = this;

    //logger.info(this);

    //var year  = req.params.year,
        //month = req.params.month,
        //posts = [];

    //for (var i = 0; i < this.postData.length; i++) {
        //var postYear = Date.create(this.postData[i].date).format('{yyyy}');
        //var postMonth = Date.create(this.postData[i].date).format('{MM}');

        //if (postYear == year && postMonth == month) {
            //// logger.info('dates match for ' + this.postData[i].title)
            //posts.push(this.postData[i]);
        //}
        //else
            //logger.info('No match — year: ' + postYear + " (" + year + ") | month: " + postMonth + " (" + month + ")");
    //}

    //paginator.paginate(posts, this.postData[0].maxPosts, req, res, function (realPage) {
        //if (realPage) return res.redirect('/' + year + '/' + month + '/?page=' + realPage);

        //res.render('blogIndex', {
            //pageTitle: 'All of ' + Date.create(month + '-' + year).format('{Month}, {yyyy}'),
            //blogSubtitle: self.postData[0].blogSubtitle,
            //bodyId: 'archive',
            //blogTitle: self.postData[0].blogTitle,
            //blogAuthor: self.postData[0].blogAuthor,
            //blogAuthorEmail: self.postData[0].blogAuthorEmail,
            //gravatar: self.postData[0].gravatar,
            //blogBio: self.postData[0].blogBio,
            //rssUrl: self.postData[0].rssUrl
        //});
    //});
//};


//Views.prototype.blogDateIndex = function (req, res) {
    //logger.info('views.blogDateIndex');

    //var self = this;

    //var year  = req.params.year,
        //month = req.params.month,
        //day   = req.params.day,
        //posts = [];

    //for (var i = 0; i < this.postData.length; i++) {
        //var postYear = Date.create(this.postData[i].date).format('{yyyy}');
        //var postMonth = Date.create(this.postData[i].date).format('{MM}');
        //var postDay = Date.create(this.postData[i].date).format('{dd}');

        //if (postYear == year && postMonth == month && postDay == day) {
            //posts.push(this.postData[i]);
        //}
    //}

    //paginator.paginate(posts, this.postData[0].maxPosts, req, res, function (realPage) {
        //if (realPage) return res.redirect('/' + year + '/' + month + '/' + day + '/?page=' + realPage);

        //res.render('blogIndex', {
            //pageTitle: Date.create(year + '-' + month + '-' + day).format('{Month} {d}, {yyyy}'),
            //blogSubtitle: self.postData[0].blogSubtitle,
            //bodyId: 'archive',
            //blogTitle: self.postData[0].blogTitle,
            //blogAuthor: self.postData[0].blogAuthor,
            //blogAuthorEmail: self.postData[0].blogAuthorEmail,
            //gravatar: self.postData[0].gravatar,
            //blogBio: self.postData[0].blogBio,
            //rssUrl: self.postData[0].rssUrl
        //});
    //});
//};

//Views.prototype.blogPost = function (req, res) {

    //logger.info(this);

    //logger.info('views.blogPost');
    //var slug = req.params.pslug,
        //year  = req.params.year,
        //month = req.params.month,
        //day   = req.params.day;

    //var thisSlug = year + '-' + month + '-' + day + '-' + slug;
    //var thisPost = _.findWhere(this.postData, {fullSlug: thisSlug });

    //res.render('post', {
        //pageTitle: thisPost.title,
        //blogTitle: thisPost.blogTitle,
        //blogSubtitle: thisPost.blogSubtitle,
        //blogAuthor: thisPost.blogAuthor,
        //blogAuthorEmail: thisPost.blogAuthorEmail,
        //gravatar: thisPost.gravatar,
        //blogBio: thisPost.blogBio,
        //rssUrl: thisPost.rssUrl,
        //bodyId: 'post',
        //slug: slug,
        //title: thisPost.title,
        //date: thisPost.formattedDate,
        //author: thisPost.author,
        //content: thisPost.postBody,
        //type: thisPost.type
    //});
//};

//// 404
//Views.prototype.notFound = function (req, res) {
    //logger.info('views.notFound');
    //if (this.framework === 'hapi') {
        ////TODO make this work
        //res.render('404', {status: 404, bodyId: 'fourohfour'});
    //}
    //res.render('404', {status: 404, bodyId: 'fourohfour'});
//};


module.exports = Views;

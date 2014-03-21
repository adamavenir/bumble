var EventEmitter = require('events').EventEmitter;
var logger = require('bucker').createLogger();
var walk = require('walk');
var fs = require('fs');
var wtchr = require('wtchr');
var marked = require('marked');
var yaml = require('yamljs');
var _ = require('underscore');
var gravatar = require('gravatar');
var util = require('util');
var dateFormat = /(\d{4})\-((0|1)\d)\-((0|1|2|3)\d)-/;
var posts = [];
var postDate, postSlug, postDateText;

require('sugar');

marked.setOptions({
    breaks: true,
    smartypants: true,
});

function ParsePosts() {
    EventEmitter.call(this);
}

util.inherits(ParsePosts, EventEmitter);

ParsePosts.prototype.parseFile = function (config, file, callback) {

    var postDir = require('path').dirname(require.main.filename) + '/' + config.postDir;

    // set the slug to the filename
    postSlug = file.name.remove(dateFormat).remove('.md');
    // var postSlug = 'readme';
    //logger.debug('02 postSlug: ' + postSlug);

    // does it start with the proper date format? (YYYY-MM-DD)
    if (file.name.startsWith(dateFormat)) {
        postDateText = file.name.first(10);
        postDate = Date.create(postDateText);
        //logger.debug('03 postDate: ' + postDate + ' (from filename)');
        buildData(config, postDateText, postSlug);
    }

    else {
        // get the date from the file created timestamp
        postDate = Date.create(fs.statSync(postDir + '/' + file.name).ctime);
        //logger.debug('03 postDate: ' + postDate + ' (from timestamp)');
    }

    // helper function to check for and load metadata
    // if the first line of the file does not start with # we return an
    // empty hash, otherwise we parse until we find a line that does not start with #
    // metadata should be saved in the form
    // # key: value
    function loadMetadata(config, file) {
        var metadata = {};
        var post = [];
        var front_matter = [];

        var in_metadata = false;
        var done = false;
        var lines = file.split(/\n|\r\n/);
        lines.forEach(function (line) {
            if (done) {
                post.push(line);
            } else if (!in_metadata) {
                if (line.match(/^---/)) {
                    in_metadata = true;
                } else {
                    post.push(line);
                }
            } else if (in_metadata) {
                if (!line.match(/^---/)) {
                    front_matter.push(line);
                } else {
                    in_metadata = false;
                    done = true;
                }
            }
        });

        front_matter = front_matter.join('\n');
        post = post.join('\n');

        metadata = yaml.parse(front_matter);

        return _.extend({}, metadata, {
            postBody: marked(post),
            title: metadata.title,
            date: Date.create(metadata.date),
            slug: metadata.slug,
            blogTitle: config.blogTitle,
            blogSubtitle: config.blogSubtitle,
            author: metadata.author || config.blogAuthor,
            blogAuthor: config.blogAuthor,
            blogAuthorEmail: config.blogAuthorEmail,
            blogBio: config.blogBio,
            siteUrl: config.siteUrl,
            rssUrl: config.rssUrl,
            gravatar: gravatar.url(config.blogAuthorEmail, 100),
            maxPosts: config.maxPosts
        });
    }

    // read the metadata and markdown associated with each post
    function buildData(config, postDateText, postSlug) {
        var postDir = require('path').dirname(require.main.filename) + '/' + config.postDir;

        fs.readFile(postDir + '/' + file.name, 'utf8', function (err, data) {
            //logger.debug('reading file: blog/' + postDateText + '-' + postSlug + '.md');

            var postData = loadMetadata(config, data, file.name);
            postData.formattedDate = Date.create(postData.date).format('{Mon} {dd}, {yyyy}');
            postData.fullSlug = Date.create(postData.date).format('{yyyy}-{MM}-{dd}') + '-' + postSlug;
            postData.url = config.blogHome + Date.create(postData.date).format('{yyyy}/{MM}/{dd}/') + postSlug;
            postData.permalink = config.siteUrl + postData.url;

            // add the metadata to the post array
            //logger.debug(require('util').inspect(postData, false, null, true));
            posts.push(postData);

            // go to the next file
            callback();
        });
    }

    //logger.info(util.inspect(posts));
};

ParsePosts.prototype.setup = function (config) {

    var self = this;

    var postDir = require('path').dirname(require.main.filename) + '/' + config.postDir;

    var walker = walk.walk(postDir);

    walker.on("file", function (root, file, next) {
        // logger.info('walking files');
        // does the file have a .md extension?
        if (file.name.endsWith('.md')) {
            self.parseFile(config, file, next);
        }
        else {
            next();
        }
    });

    walker.on("end", function () {

        // logger.info(util.inspect(posts));

        self.emit('ready', posts, config);
        // logger.info('walked, loaded and ready');

        var watcher = wtchr(postDir);

        watcher.on('create', function (filename) {
            if (!filename.match(/\.md$/)) return;
            var file = filename.replace(postDir + '/', '');
            logger.debug('adding new file:', file);
            self.parseFile(config, { name: file }, function () {
                self.emit('update', posts);
                logger.info('watcher found a new file');
            });
        });

        watcher.on('change', function (filename) {
            if (!filename.match(/\.md$/)) return;
            var file = filename.replace(postDir + '/', '');
            logger.debug('changing file:', file);
            var postIndex = posts.indexOf(_.findWhere(posts, { fullSlug: file.replace(/\.md$/, '') }));
            posts.splice(postIndex, 1);
            self.parseFile(config, { name: file }, function () {
                self.emit('update', posts);
                logger.info('watcher found an updated file');
            });
        });

        watcher.on('delete', function (filename) {
            if (!filename.match(/\.md$/)) return;
            var file = filename.replace(postDir + '/', '');
            logger.debug('deleting file: %s', file);
            var postIndex = posts.indexOf(_.findWhere(posts, { fullSlug: file.replace(/\.md$/, '') }));
            posts.splice(postIndex, 1);
            self.emit('update', posts);
            logger.info('watcher found a deleted file');
        });

    });

};

module.exports = ParsePosts;

var EventEmitter = require('events').EventEmitter;
var walk = require('walk');
var fs = require('fs');
var wtchr = require('wtchr');
var marked = require('marked');
var hljs = require('highlight.js');
var yaml = require('js-yaml');
var _ = require('underscore');
var gravatar = require('gravatar');
var util = require('util');
var slugger = require('slugger');
var posts = [];

require('sugar');

marked.setOptions({
    breaks: true,
    smartypants: true,
    highlight: function highlightCode(code, lang) {
        if (hljs.getLanguage(lang)) { //Highlight 'em if you got 'em
            return hljs.highlight(lang, code).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

function ParsePosts() {
    EventEmitter.call(this);
}

//Slugifies and trims tag
function cleanTag(tag) {
    return slugger(tag.trim());
}

util.inherits(ParsePosts, EventEmitter);


ParsePosts.prototype.parseFile = function (file, done) {
    var self = this;
    var postDir = require('path').dirname(require.main.filename) + '/' + self.config.postDir;

    // read the metadata and markdown associated with this post
    fs.readFile(postDir + '/' + file.name, 'utf8', function (err, data) {
        var postData;
        if (err) {
            self.config.log(['error', 'bumble'], 'Error reading post `' + file.name + '`, skipping ' + err.stack);
            // skip this file
            return done();
        }
        function mapTag(tag) {
            postData.tagMap[cleanTag(tag)] = tag.trim();
        }

        // add the metadata to the post array
        postData = parsePostData(data, file.name);

        //yaml uses null. boo.
        if (postData.tags === null) { postData.tags = ''; }

        postData.date = Date.create(postData.date);
        postData.formattedDate = postData.date.format('{Mon} {dd}, {yyyy}');
        postData.fullSlug = postData.date.format('{yyyy}-{MM}-{dd}') + '-' + postData.slug;
        postData.url = self.config.blogHome + postData.date.format('{yyyy}/{MM}/{dd}/') + postData.slug;
        postData.permalink = self.config.siteUrl + postData.url;
        postData.authorSlug = slugger(postData.author);
        postData.authorGravatar = gravatar.url(postData.authorEmail, self.config.avatarSize);
        //Tag object sent to view, includes original tag and slug
        postData.tagMap = {};
        postData.tags.split(',').forEach(mapTag);
        //Tags used by bumble to return /tags/:tag
        postData.tags = _.map(postData.tags.split(','), cleanTag);
        postData.lastTag = _.last(postData.tags);
        postData.tagCount = postData.tags.length;

        posts.push(postData);

        // go to the next file
        done();
    });

    // If the first line of the file does not start with --- we return an
    // empty hash, otherwise we parse until we find a line that does not start with #
    // metadata should be saved in the form
    // ---
    // (yaml data)
    // ---
    // yaml data will then be parsed
    function parsePostData(file, name) {
        var postDate;
        var postData = {};
        var post = [];
        var metadata = [];

        var in_metadata = false;
        var in_old_metadata = false;
        var done = false;
        var lines = file.split(/\n|\r\n/);
        var dateFormat = /(\d{4})\-((0|1)\d)\-((0|1|2|3)\d)-/;

        if (name.startsWith(dateFormat)) {
            postDate = Date.create(name.first(10));
        } else {
            postDate = Date.create(fs.statSync(postDir + '/' + name).ctime);
        }

        lines.forEach(function (line) {
            if (done) {
                post.push(line);
            } else if (!in_metadata) {
                if (line.match(/^---/)) {
                    in_metadata = true;
                } else if (line.match(/^\# /)) {
                    in_metadata = true;
                    in_old_metadata = true;
                    metadata.push(line.slice(2));
                } else {
                    post.push(line);
                }
            } else if (in_metadata) {
                if (line.match(/^\# /)) {
                    metadata.push(line.slice(2));
                } else if (!line.match(/^---/) && !in_old_metadata) {
                    metadata.push(line);
                } else {
                    in_metadata = false;
                    done = true;
                }
            }
        });

        metadata = metadata.join('\n');
        post = post.join('\n');

        postData = yaml.load(metadata) || {};

        return _.defaults(postData, {
            postBody: marked(post),
            slug: name.remove(dateFormat).remove('.md'), // set the slug to the filename minus optional dateFormat
            date: postDate,
            tags: '',
            author: self.config.blogAuthor,
            authorEmail: self.config.blogAuthorEmail,
        });
    }
};

ParsePosts.prototype.setup = function (config) {

    var self = this;

    var postDir = require('path').dirname(require.main.filename) + '/' + config.postDir;

    var walker = walk.walk(postDir);

    self.config = config;

    walker.on("file", function (root, file, next) {
        // does the file have a .md extension?  ignore the readme if it's there
        if (file.name.endsWith('.md') && file.name.toLowerCase() !== 'readme.md') {
            self.parseFile(file, next);
        }
        else {
            next();
        }
    });

    walker.on("end", function () {

        self.emit('ready', posts, config);

        var watcher = wtchr(postDir);

        watcher.on('create', function (filename) {
            if (!filename.match(/\.md$/)) return;
            var file = filename.replace(postDir + '/', '');
            self.config.log(['debug', 'bumble'], 'adding new file: ' + file);
            self.parseFile({ name: file }, function () {
                self.emit('update', posts);
                self.config.log(['info', 'bumble'], 'watcher found a new file');
            });
        });

        watcher.on('change', function (filename) {
            if (!filename.match(/\.md$/)) return;
            var file = filename.replace(postDir + '/', '');
            self.config.log(['debug', 'bumble'], 'changing file: ' + file);
            var postIndex = posts.indexOf(_.findWhere(posts, { fullSlug: file.replace(/\.md$/, '') }));
            posts.splice(postIndex, 1);
            self.parseFile({ name: file }, function () {
                self.emit('update', posts);
                self.config.log(['info', 'bumble'], 'watcher found an updated file');
            });
        });

        watcher.on('delete', function (filename) {
            if (!filename.match(/\.md$/)) return;
            var file = filename.replace(postDir + '/', '');
            self.config.log(['debug', 'bumble'], 'deleting file: ' + file);
            var postIndex = posts.indexOf(_.findWhere(posts, { fullSlug: file.replace(/\.md$/, '') }));
            posts.splice(postIndex, 1);
            self.emit('update', posts);
            self.config.log(['info', 'bumble'], 'watcher found a deleted file');
        });

    });

};

module.exports = ParsePosts;

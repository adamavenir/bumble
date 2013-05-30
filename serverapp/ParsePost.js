var EventEmitter = require('events').EventEmitter,
    path    = require('path'),
    logger  = require('winston'),
    walk    = require('walk'),
    sugar   = require('sugar'),
    jf      = require('jsonfile'),
    util    = require('util'),
    fs      = require('fs'),
    config  = require('getconfig'),
    marked  = require('marked');

var dir = config.blogDir,
    home = config.blogHome;

var configData = {
  blogTitle:     config.blogTitle,
  blogSubTitle:  config.blogSubTitle,
  siteUrl:       config.siteUrl,
  rssUrl:        config.rssUrl,
};

function ParsePosts(dir) {
  EventEmitter.call(this);
}

ParsePosts.prototype = new EventEmitter();

ParsePosts.prototype.setup = function (blogDir, blogHome) {

  var self = this,
      dir = blogDir,
      home = blogHome,
      walker = walk.walk(dir),
      dateFormat = /(\d{4})\-((0|1)\d)\-((0|1|2|3)\d)-/,
      posts = [], 
      postDate, postSlug, postDateText;
      mdFiles = [], htmlFiles = [];

  if (home == '/') { home == '' };

  var getData = function (file) {
    jf.readFile(__dirname + '/../' + dir + "/" + postDateText + '-' + postData.slug + '.json', function (err, obj) {
            if (err) { logger.error("Bonk" + util.inspect(err)) };
  };

  var md = function (file, fileExt) {
    logger.info('called markdown processor');

    var postData = configData;

    if (file['name'].startsWith(dateFormat)) {
      postData.date = Date.create(file['name'].first(10));
    }
    else {
      // get the date from the file created timestamp
      postDate = Date.create(fs.stat(dir + '/' + file['name']).ctime);
    };

    postData.file      = file['name'].remove('.' + fileExt);
    postData.slug      = file['name'].remove('.' + fileExt).remove(dateFormat);
    postData.url = home + Date.create(postData.date).format('{yyyy}/{MM}/{dd}/') + postData.slug;

    postData.permalink = postData.siteUrl + postData.url;
    jf.readFile(__dirname + '/../' + dir + "/" + postDateText + '-' + postData.slug + '.json', function (err, obj) {
                if (err) { logger.error("Bonk" + util.inspect(err)) };
    logger.info('postData: ' + util.inspect(posts));                
    posts.push(postData);
  };

  var html = function (file, fileExt) {
    logger.info('called html processor');
  };

  var json = function (file, fileExt) {
    logger.info('called json processor');
  };

  var fileList = {
    'html': html,
    'htm': html,
    'md': md,
    'markdown': md,
    'json': json,
  };

  walker.on("file", function (root, file, next) {

    var fileExt = file['name'].split('.').pop();
    logger.info('fileExt: ' + fileExt);

    if ( fileExt == 'md' 
      || fileExt == 'markdown' 
      ) {
      mdFiles.push(file);
      fileList[fileExt](file, fileExt);
      next();
    }
    if ( fileExt == 'html'
      || fileExt == 'htm'
      ) {
      htmlFiles.push(file);
      fileList[fileExt](file, fileExt);
      next();
    }
    else {
      next();
    }
  });

  walker.on("end", function() {
    self.emit('ready', posts);
  });

}

module.exports = ParsePosts;
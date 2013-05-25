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

var dir = config.postDir,
    home = config.blogHome,
    walker = walk.walk(dir),
    endsWith = sugar.endsWith,
    dateFormat = /(\d{4})\-((0|1)\d)\-((0|1|2|3)\d)-/,
    posts = new Array(), postDate, postSlug, postDateText;

function ParsePosts() {
  EventEmitter.call(this);
}

ParsePosts.prototype = new EventEmitter();

ParsePosts.prototype.setup = function () {
  var self = this;
  if (home == '/') { home == '' };

  walker.on("file", function(root,file,next){

    // does the file have a .md extension?
    if (file['name'].endsWith('.md')) {

      // logger.info('01 matches .md');

      // set the slug to the filename
      postSlug = file['name'].remove(dateFormat).remove('.md');
      // var postSlug = 'readme';
      // logger.info('02 postSlug: ' + postSlug);      

      // does it start with the proper date format? (YYYY-MM-DD)
      if (file['name'].startsWith(dateFormat)) {
        postDateText = file['name'].first(10);
        postDate = Date.create(postDateText);
        // logger.info('03 postDate: ' + postDate + ' (from filename)');
        buildData(postDateText, postSlug);
      }

      else {
        // get the date from the file created timestamp
        postDate = Date.create(fs.stat(dir + '/' + file['name']).ctime);
        // logger.info('03 postDate: ' + postDate + ' (from timestamp)');

      };

      // read the JSON metadata and markdown associated with each post
      function buildData (postDateText, postSlug, postMarkdown) {
        fs.readFile('blog/' + postDateText + '-' + postSlug + '.md', 'utf8', function(err, data){
          // logger.info('reading file: blog/' + postDateText + '.md');
          var postMarkdown = marked(data);

          jf.readFile(__dirname + '/../' + dir + "/" + postDateText + '-' + postSlug + '.json', function (err, obj) {
            if (err) { logger.error("Bonk" + util.inspect(err)) };

            var postData = obj;
            
            postData.date = postDate;
            postData.slug = postSlug;
            postData.fullSlug = postDateText + '-' + postSlug;
            postData.blogTitle = config.blogTitle;
            postData.blogSubTitle = config.blogSubTitle;
            postData.siteUrl = config.siteUrl;
            postData.rssUrl = config.rssUrl;
            postData.url = home + Date.create(postDateText).format('{yyyy}/{MM}/{dd}/') + postSlug;
            postData.permalink = config.siteUrl + postData.url;
            postData.postBody = postMarkdown;

            // add the metadata to the post array
            posts.push(postData);

            // go to the next file
            next();
          });  
        });    
      }

      //logger.info(util.inspect(posts));

    }
    else {
      next();
    }
  });

  walker.on("end", function() {
    // logger.info(util.inspect(posts));
    self.emit('ready', posts);
    // logger.info('<<EMIT!>> <<EMIT!>> Ohboy. I think I just emit.')
  });

}

module.exports = ParsePosts;
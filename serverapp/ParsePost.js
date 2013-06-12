var EventEmitter = require('events').EventEmitter,
    path    = require('path'),
    env  = require('getconfig'),
    logger  = require('bucker').createLogger(env.bucker, module),
    walk    = require('walk'),
    sugar   = require('sugar'),
    jf      = require('jsonfile'),
    util    = require('util'),
    fs      = require('fs'),
    config  = require('../serverapp/useconfig').file('blogConfig.json'),
    marked  = require('marked');

var dir = config.postDir,
    home = config.blogHome,
    walker = walk.walk(dir),
    endsWith = sugar.endsWith,
    startsWith = sugar.startsWith,
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

      logger.debug('01 matches .md');

      // set the slug to the filename
      postSlug = file['name'].remove(dateFormat).remove('.md');
      // var postSlug = 'readme';
      logger.debug('02 postSlug: ' + postSlug);      

      // does it start with the proper date format? (YYYY-MM-DD)
      if (file['name'].startsWith(dateFormat)) {
        postDateText = file['name'].first(10);
        postDate = Date.create(postDateText);
        logger.debug('03 postDate: ' + postDate + ' (from filename)');
        buildData(postDateText, postSlug);
      }

      else {
        // get the date from the file created timestamp
        postDate = Date.create(fs.statSync(root + '/' + file['name']).ctime);
        logger.debug('03 postDate: ' + postDate + ' (from timestamp)');

      };

      // helper function to check for and load metadata
      // if the first line of the file does not start with # we return an
      // empty hash, otherwise we parse until we find a line that does not start with #
      // metadata should be saved in the form
      // # key: value
      function loadMetadata(file) {
          var lines = file.split('\n');
          var metadata = {};
          var post = [];
          var count = 0;
          var key, val;
          if (lines[0].startsWith('#')) {
              lines.some(function (line) {
                  if (line.startsWith('#')) {
                      count++;
                      var parsed = /(\w+)\:(.*)$/.exec(line);
                      console.log('LINE:', parsed);
                      if (parsed) {
                          metadata[parsed[1].trim()] = parsed[2].trim();
                      }
                  } else {
                      return true;
                  }
              });
              post = lines.slice(count).join('\n');
          } else {
              post = lines.join('\n');
          }

          return {
              postBody: marked(post),
              title: metadata.title || lines[count - 1].slice(1).trim(),
              date: metadata.date ? Date.create(metadata.date) : postDate,
              slug: metadata.slug || postSlug,
              blogTitle: config.blogTitle,
              blogSubTitle: config.blogSubTitle,
              author: metadata.author || config.blogAuthor,
              siteUrl: config.siteUrl,
              rssUrl: config.rssUrl
          }
      }

      // read the metadata and markdown associated with each post
      function buildData (postDateText, postSlug, postMarkdown) {
        fs.readFile('blog/' + postDateText + '-' + postSlug + '.md', 'utf8', function(err, data){
          logger.debug('reading file: blog/' + postDateText + '-' + postSlug + '.md');

          var postData = loadMetadata(data);
          postData.formattedDate = Date.create(postData.date).format('{Mon} {dd}, {yyyy}');
          postData.fullSlug = Date.create(postData.date).format('{yyyy}-{MM}-{dd}') + '-' + postSlug;
          postData.url = home + Date.create(postData.date).format('{yyyy}/{MM}/{dd}/') + postSlug;
          postData.permalink = config.siteUrl + postData.url;

          // add the metadata to the post array
          logger.debug(require('util').inspect(postData, false, null, true));
          posts.push(postData);

          // go to the next file
          next();
          // });  
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

var path  = require('path'),
  logger  = require('winston'),
  walk    = require('walk'),
  marked  = require('marked'),
  sugar   = require('sugar'),
  jf      = require('jsonfile'),
  util    = require('util'),
  fs      = require('fs')

// homepage
exports.index = function (req, res) {
  res.render('index', {pageTitle: 'home', bodyId: 'home'});
}; 

exports.blogIndex = function (req, res) {

  var walker = walk.walk('blog'),
      endsWith = sugar.endsWith,
      dateFormat = /(\d{4})\-((0|1)\d)\-((0|1|2|3)\d)-/,
      posts = new Array(),
      postData = {},
      postDate = "",
      postSlug = "",
      postDateTeaxt = "";
      // , postDate, postSlug, postDateText;

  walker.on("file", function(root,file,next){

    // does the file have a .md extension?
    if (file['name'].endsWith('.md')) {

      logger.info('01 matches .md');

      // set the slug to the filename
      // postSlug = file['name'].remove(dateFormat).remove('.md');
      postSlug = 'readme';
      logger.info('02 postSlug: ' + postSlug);      

      // does it start with the proper date format? (YYYY-MM-DD)
      if (file['name'].startsWith(dateFormat)) {
        postDateText = file['name'].first(10);
        postDate = Date.create(postDateText)
        logger.info('03 postDate: ' + postDate + ' (from filename)');
      }

      else {
        // get the date from the file created timestamp
        postDate = Date.create(fs.stat('blog/' + file['name']).ctime);
        logger.info('03 postDate: ' + postDate + ' (from timestamp)');

      };

      // read the JSON metadata associated with each post
      jf.readFile('blog/' + postDateText + '-' + postSlug + '.json', function (err, obj, postDate, postSlug) {

        logger.info('04 reading file: blog/' + postDateText + '-' + postSlug + '.json')

        logger.info('05 obj: ' + obj + ' | postDate: ' + postDate + ' | postSlug: ' + postSlug);

        postData = obj;
        logger.info('06 postData: ' + postData + ' | postDate: ' + postDate + ' | postSlug: ' + postSlug);
        // postData.date = postDate;
        // postData.slug = postSlug;

        // add the metadata to the post array
        posts.push(postData);

        // go to the next file
        next();
        logger.info('   - - - - - - - - - - - - - - - ')
      })      

    }
    else {
      next();
    }
  });

  walker.on("end", function() {
    res.render('blogIndex', { 
      pageTitle: 'All posts', 
      bodyId: 'archive',
      postData: posts,
      postUrl: '/blog/'
    });
  });

};

exports.blogPost = function (req, res) {
  var slug = req.params.pslug, markdown;

  // get the file based on the slug in the request
  fs.readFile('blog/' + slug + '.md', 'utf8', function(err, data){
    markdown = marked(data);
    getData(slug, markdown);
  })

  // get the JSON data based on the slug
  function getData (slug, markdown) {
      jf.readFile('blog/' + slug + '.json', function(err, obj){
      postData = obj;
      render (slug, markdown, postData);
    })
  };

  // render markdown and JSON metadata
  function render(slug, markdown, postData) {
    res.render('post', {
      pageTitle: 'blog', 
      bodyId: 'post',
      slug: slug,
      content: markdown,
      title: postData.title,
      date: postData.date,
      author: postData.author
    });
  };

};

// 404
exports.notFound = function (req, res) {
  res.render('404', {status: 404, bodyId: 'fourohfour'});
};
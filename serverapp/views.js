var path  = require('path'),
  logger  = require('winston'),
  walk    = require('walk'),
  marked  = require('marked')
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
      truncate = sugar.truncate,
      posts = new Array(),
      postData = {};

  walker.on("file", function(root,file,next){
    var ext = file['name'].slice(-2);
    logger.info('ext: ' + ext)

    if (ext == 'md') {

      // get the file, but remove file extension
      var file = file['name'].substring(0, file['name'].lastIndexOf('.'));
      logger.info('file: ' + file);

      var slug = file.substring(0);
      logger.info('slug: ' + slug)

      jf.readFile('blog/' + slug + '.json', function(err, obj){
        postData = obj;
        logger.info('postData: ' + util.inspect(postData));
        posts.push(postData);
        logger.info('posts: '+ util.inspect(posts));
        next();
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
  fs.readFile('blog/' + slug + '.md', 'utf8', function(err, data){
    markdown = marked(data);
    render(markdown);
  })
  function render(markdown) {
    res.render('post', {
      pageTitle: 'blog', 
      bodyId: 'post',
      slug: slug,
      content: markdown
    });
  };
  logger.info('Blog post requested: ' + slug);
};

// 404
exports.notFound = function (req, res) {
  res.render('404', {status: 404, bodyId: 'fourohfour'});
};
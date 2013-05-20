var path = require('path'),
  logger = require('winston'),
  walk = require('walk'),
  marked = require('marked')
  // slug = require('slugger'), TODO — why can't it find this?
  fs = require('fs')

// homepage
exports.index = function (req, res) {
  res.render('index', {pageTitle: 'home', bodyId: 'home'});
}; 

exports.blogIndex = function (req, res) {

  var walker = walk.walk('blog'),
      files = new Array(),
      fileName,
      slug;

  walker.on("file", function(root,file,next){
    // get the file, but remove file extension
    var file = file['name'].substring(0, file['name'].lastIndexOf('.'));
    // push without /blog prefix
    fileName = file.substring(file.indexOf('/'));
    // slug = slug.slugger(file)
    files.push(fileName);
    next();
  });

  walker.on("end", function() {
    res.render('blogIndex', { 
      pageTitle: 'All posts', 
      bodyId: 'archive',
      postList: files,
      urlPath: 'blog/'
    });
  });

};

exports.blogPost = function (req, res) {
  var slug = req.params.pslug;
  // var markdown = marked(fs.readFileSync('blog/' + slug + ".md")); TODO — why doesn't this work?
  var markdown = fs.readFileSync('blog/' + slug + ".md");
  res.render('post', {
    pageTitle: 'blog', 
    bodyId: 'post',
    slug: slug,
    content: markdown
  });
  logger.info('Blog post requested: ' + slug);
};

// 404
exports.notFound = function (req, res) {
  res.render('404', {status: 404, bodyId: 'fourohfour'});
};
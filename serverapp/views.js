var path  = require('path'),
  logger  = require('winston'),
  walk    = require('walk'),
  marked  = require('marked')
  jf      = require('jsonfile'),
  util    = require('util'),
  fs      = require('fs')

// homepage
exports.index = function (req, res) {
  res.render('index', {pageTitle: 'home', bodyId: 'home'});
}; 

exports.blogIndex = function (req, res) {

  var walker = walk.walk('blog'),
      posts = new Array(),
      postData = {};

  walker.on("file", function(root,file,next){

    // pop off the last two characters
    var ext = file['name'].slice(-2);

    // does the file end in md?
    if (ext == 'md') {

      // get the file object, but remove file extension
      var file = file['name'].substring(0, file['name'].lastIndexOf('.'));

      // isolate the file name
      var slug = file.substring(0);

      // read the JSON metadata associated with each post
      jf.readFile('blog/' + slug + '.json', function(err, obj){
        postData = obj;

        // add the metadata to the post array
        posts.push(postData);

        // go to the next file
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
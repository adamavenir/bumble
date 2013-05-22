var logger  = require('winston'),
    marked  = require('marked'),
    sugar   = require('sugar'),
    util    = require('util'),
    fs      = require('fs');

var parsePosts  = new (require('./ParsePost'))();

var postData;

// parse and load the post files into memory
parsePosts.on('ready', function(posts) {
    logger.info("got ready event from parsePosts");
    logger.info(util.inspect(posts)); 
    postData = posts;
});

parsePosts.setup();

// homepage
exports.index = function (req, res) {
  res.render('index', {
    pageTitle: 'home', 
    bodyId: 'home'
  });
}; 

exports.blogIndex = function (req, res) {
  res.render('blogIndex', { 
    pageTitle: 'All posts', 
    bodyId: 'archive',
    postData: postData,
    postUrl: '/blog/'
  });
};

exports.blogYearIndex = function (req, res) {
  var year  = req.params.year,
      month = req.params.month,
      day   = req.params.day,
      posts = new Array();

  for (var i = 0; i < postData.length; i++) {

    var postYear = Date.create(postData[i].date).format('{yyyy}');

    if (postYear == year) {
      posts.push(postData[i]);
    }
  };

  res.render('blogIndex', { 
    pageTitle: 'Year Archive', 
    bodyId: 'archive',
    postData: posts,
    postUrl: '/blog/' + year + '/'
  });

};

exports.blogMonthIndex = function (req, res) {
  var year  = req.params.year,
      month = req.params.month,
      posts = new Array();

  for (var i = 0; i < postData.length; i++) {

    var postYear = Date.create(postData[i].date).format('{yyyy}');
    var postMonth = Date.create(postData[i].date).format('{MM}');

    if (postYear == year && postMonth == month) {
      logger.info('dates match for ' + postData[i].title)
      posts.push(postData[i]);
    }
    else
      logger.info('No match — year: ' + postYear + " (" + year + ") | month: " + postMonth + " (" + month + ")");
  };

  res.render('blogIndex', { 
    pageTitle: 'Month Archive', 
    bodyId: 'archive',
    postData: posts,
    postUrl: '/blog/' + year + '/' + month + '/'
  });
};


exports.blogDateIndex = function (req, res) {
  var year  = req.params.year,
      month = req.params.month,
      day   = req.params.day,
      posts = new Array();

  for (var i = 0; i < postData.length; i++) {

    var postYear = Date.create(postData[i].date).format('{yyyy}');
    var postMonth = Date.create(postData[i].date).format('{MM}');
    var postDay = Date.create(postData[i].date).format('{dd}');

    if (postYear == year && postMonth == month && postDay == day) {
      posts.push(postData[i]);
    }
  };
  
    res.render('blogIndex', { 
      pageTitle: 'Date Archive', 
      bodyId: 'archive',
      postData: posts,
      postUrl: '/blog/' + year + '/' + month + '/' + day + '/'
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
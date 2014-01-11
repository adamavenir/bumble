![](http://f.cl.ly/items/2P210d0M2B0v3Z3q1R03/bumble.jpg)

bumble
======
A very simple markdown blog module

Bumble can:

- Serve Markdown data from ``posts`` directory 
- Read yaml metadata
- Provide date-based archives
- Adds Gravatar based on Author email
- Read Tumblr URLs and ``301 Redirect``
- Comes with simple, default styles.

## Add the module to your app

```
var Bumble = require('bumble');
var config = require('./bumbleConfig.json');

var app    = express();

var bumble = new Bumble(app, config);

app.listen(3000);

logger.info('bumble running on the year 3000');

```

Check out the [example](https://github.com/adambrault/bumble/tree/master/example) for some simple default templates and styles.


## Set your defaults in ``bumbleConfig.json``

```
{
  "blogTitle": "Name of blog",
  "blogSubtitle": "Here's a tag line",
  "blogAuthor": "Blog Author",
  "blogAuthorEmail": "author@example.com",
  "blogBio": "One day, I decided to write a blog. This is the story of that blog.",
  "siteUrl": "http://example.com",
  "rssUrl": "http://example.com/feed/rss",
  "postDir": "posts",
  "blogHome": "/",
  "maxPosts": "10"
}
```

``maxPosts`` will set the maximum number of posts available on the main page and RSS feed.

``blogHome`` will accept routes like ``/`` or ``/blog`` or ``/somethingelse``.

Put a markdown file in the ``blog`` directory (or whichever you've chosen in ``postDir``) in this format:

```
YYYY-MM-DD-this-is-the-name-of-the-post.md
```

URL slug will be set by the filename. Title will be taken from the first line, if it contains metadata or will fall back to "untitled" in the index.

## Adding metadata:

Just include a simple section of yaml at the header of each post, fenced in with three dashes and using these keys:
```
---
date: 2013-06-02 22:04:39 GMT
slug: well-yep-another-post
tags: sample
title: Well, yep, another post!
---
```

## Who uses bumble?
- [Adam Brault](http://adambrault.com)
- [&yet](http://blog.andyet.com)
- [^Lift Security](https://blog.liftsecurity.io/)
- [Fritzy](http://gists.fritzy.io/)

If you're using bumble, submit a pull request and add yourself to this list. :)


## Contributors
- [Adam Brault](http://twitter.com/adambrault)
- [Nathan LaFreniere](http://twitter.com/quitlahok)
- [Aaron McCall](http://twitter.com/aaronmccall)
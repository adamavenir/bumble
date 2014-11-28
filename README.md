![](http://f.cl.ly/items/2P210d0M2B0v3Z3q1R03/bumble.jpg)

bumble
======
A very simple markdown blog module

- Serve markdown + yaml text files from configurable directory 
- Provide date-based archives
- Adds Gravatar based on Author email
- Read Tumblr URLs and ``301 Redirect``
- Comes with simple, default templates and styles (in the ``example`` folder).
- Uses [hapi](http://hapijs.org)

## Add the module to your app

```
npm install bumble
```

```
var Hapi = require('hapi');
var config = require('./bumbleConfig.json');

var server = new Hapi.Server('0.0.0.0', 3000 || process.env.PORT);

server.views({
    engines: { jade: 'jade' },
    path: 'views',
});

server.route({
    method: 'get',
    path: '/css/{path*}',
    handler: { directory: { path: 'public/css' } }
});

server.route({
    method: 'get',
    path: '/js/{path*}',
    handler: { directory: { path: 'public/js' } }
});

server.pack.require({ 'bumble': config }, function (err) {
    if (err) throw err;

    server.start(function () {
        console.log('bumble running on the port ' + server.info.port);
    });
});

```

The above should enable you to quickly run bumble from a docker instance.

Check out the [full example](https://github.com/adambrault/bumble/tree/master/example) for some simple default templates and styles.


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
  "maxPosts": 10,
  "introPostWords": 100,
  "browserCache": 3600000,
  "labels": ["blog", "http"]
}
```

``maxPosts`` will set the maximum number of posts available on the main page and RSS feed.

``introPostWords`` will truncate the opening paragraphs at 100 words, including *at least* the opening paragraph, and never cutting off a line mid-sentence.

``blogHome`` will accept routes like ``/`` or ``/blog`` or ``/somethingelse``.

``labels`` can be a string or an array, or not provided at all.  Please see <a href='http://hapijs.com/api/v6.2.0#pluginselectlabels'>Hapi API docs</a> for more info on labels

Put markdown files in the ``blog`` directory (or whichever you've chosen in ``postDir``)

If you add to the metadata (1) a proper timestamp to the ``date`` field in metadata, *and/or* (2) a hyphenated version of the url name to the ``slug`` field, then (respectively of which you add) it doesn't matter what you name the markdown files.

Alternatively, to automatically date and slugify your urls, name your files in this format:

```
YYYY-MM-DD-this-is-the-name-of-the-post.md
```

## Adding metadata:

Just include a simple section of YAML at the header of each post, fenced in with three dashes and using these keys:
```
---
date: 2013-06-02 22:04:39 GMT
slug: well-yep-another-post
tags: sample, example
title: Well, yep, another post!
---
```

## Who uses bumble?
- [Adam Brault](http://adambrault.com)
- [&yet](http://blog.andyet.com)
- [^Lift Security](https://blog.liftsecurity.io/)
- [Fritzy](http://gists.fritzy.io/)
- [The Danger Computer](http://danger.computer)

If you're using bumble, submit a pull request and add yourself to this list. :)


## Contributors
- [Adam Brault](//twitter.com/adambrault)
- [Gar](//twitter.com/wraithgar)
- [NLF](//twitter.com/quitlahok)
- [Aaron McCall](//twitter.com/aaronmccall)
- [Julien Genestoux](//twitter.com/julien51)
- [Adam Baldwin](//twitter.com/adam_baldwin)

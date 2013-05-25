bumble
======
A very simple personal website and blog. (Work in progress!)

![](http://f.cl.ly/items/2P210d0M2B0v3Z3q1R03/bumble.jpg)

## bumble can!

- Read Tumblr URLs and ``301 Redirect``
- Serve Markdown data from ``blog`` directory using jade templates
- Read JSON files with the same name as Markdown files for post metatada
- Serve any static files provided in ``views/static``
- Provide an index of available blog posts at ``/blog`` based on contents of ``blog`` directory
- Provide date-based archives
– Serve RSS
– Serve a configurable number of posts on the home page and RSS

## Howto
Set your defaults in ``dev_config.json``

```
{
  "blogTitle": "example.com",
  "blogSubtitle": "This is my tagline, just so you know.",
  "siteUrl": "http://example.com",
  "rssUrl": "http://example.com/feed/rss",
  "postDir": "blog",
  "blogHome": "/",
  "maxPosts": "10",

  "baseUrl": "https://localhost:3000",
  "http": {
    "port": 3000
  }
}
```

``maxPosts`` will set the maximum number of posts available on the main page and RSS feed.

``blogHome`` will accept routes like ``/`` or ``/blog`` or ``/somethingelse/``. Just make sure whatever you use starts and ends with a slash. :)

Put a markdown file in the ``blog`` directory (or whichever you've chosen in ``postDir``) in this format:

```
YYYY-MM-DD-this-is-the-name-of-the-post.md
```

For each post, add matching ``.json`` files with the following format:
```
{
  "title": "Another post about how much I love to blog about blog posts",
  "author": "Adam Brault",
}
```

## Todo:
- Starter styling
- Pagination
- Breadcrumbs
- Persona authentication
- Smarter Tumblr redirect
- Basic template
- "New post" form
- Import from Tumblr
- Support for HTML posts
- Compile to static HTML
- Automagic typography
- Fallbacks for posts without JSON
- Make slugs more awesome
- Add smart redirects
- +1 post interaction
- Form for easily adding a new post
- Form for easily editing posts
- Home index
- Quotes
- Talks
- Links
- Photos
- Videos
- About

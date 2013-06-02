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
- Comes with simple, default styles, built on Foundation.
- Adds Gravatar based on Author email

## Howto
Set your defaults in ``blogConfig.json``

```
{
  "blogTitle": "Name of blog",
  "blogSubtitle": "Here's a tag line",
  "blogAuthor": "Blog Author",
  "blogAuthorEmail": "author@example.com",
  "blogBio": "One day, I decided to write a blog. This is the story of that blog.",
  "siteUrl": "http://example.com",
  "rssUrl": "http://example.com/feed/rss",
  "postDir": "blog",
  "blogHome": "/",
  "maxPosts": "10"
}
```

``maxPosts`` will set the maximum number of posts available on the main page and RSS feed.

``blogHome`` will accept routes like ``/`` or ``/blog`` or ``/somethingelse/``. Just make sure whatever you use starts and ends with a slash. :)

Put a markdown file in the ``blog`` directory (or whichever you've chosen in ``postDir``) in this format:

```
YYYY-MM-DD-this-is-the-name-of-the-post.md
```

URL slug will be set by the filename. Title will be taken from the first line, if it starts with a "#" or will fall back to "untitled" in the index.


## 0.1 under development

- Proper ordering of posts
- Pagination for home page
- Pagination for individual posts
- <3 post interaction
- Support for HTML posts
- Import from Tumblr
- Watch directory for changes and update data

## Stuff under consideration

__General stuff:__
- Support for multiple authors
- Compile to static HTML or put in a database or something
- Alternate post types (quotes, photos/sets, videos, links)
- Rub git at blog server so you can ``git push publish``

__Admin:__
- Persona authentication
- Multi-user
- Configuration
- "New post" form
- "Edit post" form
- "Draft" state posts

__APIs__
- Pull in other data for moderation +/-

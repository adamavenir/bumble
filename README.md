bumble
======
A very simple personal website and blog. (Work in progress!)

![](http://f.cl.ly/items/2P210d0M2B0v3Z3q1R03/bumble.jpg)

# bumble can!

- Read Tumblr URLs and ``301 Redirect``
- Serve Markdown data from ``blog`` directory using jade templates.
- Read JSON files with the same name as Markdown files for post metatada.
- Serve any static files provided in ``views/static``.
- Provide an index of available blog posts at ``/blog`` based on contents of ``blog`` directory.

# Howto
Put ``.md`` (markdown) file in the ``blog`` directory.

For each post, add matching ``.json`` files with the following format:
```
{
  "title": "Another post about how much I love to blog about blog posts",
  "author": "Adam Brault",
  "date": "2013-02-27",
  "slug": "another-post"
}
```

# Todo:
- RSS
- Basic template
- Styling
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

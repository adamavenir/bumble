var handlers = {
    notFound: function (request, reply) {
        reply.view('404', {status: 404, bodyId: 'fourohfour'}).code(404);
    },
    tumblrRedirect: function (request, reply) {
        var url = this.views.tumblrRedirect(request.params);
        if (!url) {
            return handlers.notFound(request, reply);
        }
        return reply().redirect(url).code(301);
    },
    rss: function (request, reply) {
        reply.view('rss', this.views.rss(), {contentType: 'text/xml'});
    },
    index: function (request, reply) {
        this.views.blogIndex(request.query.page, request.params.datePart.split('/'), function _gotIndex(realPage, context) {
            if (realPage) {
                return reply().redirect('/?page=' + realPage);
            }
            if (!context) {
                return handlers.notFound(request, reply);
            }
            reply.view('index', context);
        });
    },
    blogPost: function (request, reply) {
        this.views.blogPost(request.params.year, request.params.month, request.params.day, request.params.pslug, function _gotBlogPost(context) {
            if (!context) {
                return this.routes.notFound(request, reply);
            }
            reply.view('post', context);
        });
    }
};

module.exports = handlers;

var Views = require('./views');
var Handlers = function (config, next) {
    this.config = config;
    this.views = new Views(config, next);
};

Handlers.prototype._render = function _render(request, reply, template) {
    return function renderOrRedirect(realPage, context) {
        if (realPage) {
            return reply().redirect(request.path + '?page=' + realPage);
        }
        if (!context) {
            return this.notFound(request, reply);
        }
        reply.view(template, context);
    }.bind(this);
};

Handlers.prototype.addGlobalContext = function addGlobalContext(request, reply) {
    if (request.response.source && request.response.source.context) {
        if (request.params.datePart) {
            request.response.source.context.archiveYear = request.params.datePart.split('/')[0];
        }
        if (request.params.year) {
            request.response.source.context.archiveYear = request.params.year;
        }
        request.response.source.context.allTagMap = this.views.tagMap;
        request.response.source.context.allAuthorMap = this.views.authorMap;
        request.response.source.context.archives = this.views.archives;
    }
    reply();
};

Handlers.prototype.notFound = function notFound(request, reply) {
    reply.view('404', {status: 404, bodyId: 'fourohfour'}).code(404);
};

Handlers.prototype.tumblrRedirect = function (request, reply) {
    var url = this.views.tumblrRedirect(request.params);
    if (!url) {
        return this.notFound(request, reply);
    }
    return reply().redirect(url).code(301);
};

Handlers.prototype.rss = function rss(request, reply) {
    reply.view('rss', this.views.rss(), {contentType: 'text/xml'});
};

Handlers.prototype.index = function index(request, reply) {
    this.views.blogIndex(request.query.page, request.params.datePart, this._render(request, reply, 'index'));
};

Handlers.prototype.tagIndex = function tagIndex(request, reply) {
    this.views.tagIndex(request.query.page, request.params.tag, request.params.s, this._render(request, reply, 'index'));
};

Handlers.prototype.authorIndex = function authorIndex(request, reply) {
    this.views.authorIndex(request.query.page, request.params.authorSlug, request.params.s, this._render(request, reply, 'index'));
};

Handlers.prototype.blogPost = function blogPost(request, reply) {
    this.views.blogPost(request.params.year, request.params.month, request.params.day, request.params.pslug, this._render(request, reply, 'post'));
};

module.exports = Handlers;

var _ = require('underscore');

exports.paginate = function (blogContext, allPosts, currentPage, next) {
    var maxPosts = blogContext.maxPosts;
    var maxPage = Math.ceil(allPosts.length / maxPosts);
    var posts = [], page, pos;

    if (allPosts.length > 0) {
        if (currentPage && !isNaN(Number(currentPage))) {
            page = Number(currentPage);
            if (page <= maxPage && page > 0) {
                currentPage = page;
                pos = (page - 1) * maxPosts;
                posts = allPosts.slice(pos, pos + maxPosts);
            } else {
                if (page <= 0) {
                    return next(1);
                } else {
                    return next(maxPage);
                }
            }
        } else {
            currentPage = 1;
            posts = allPosts.slice(0, maxPosts);
        }
    }
    if (posts.length === 0) {
        return next();
    }
    var context = _.defaults({
        bodyId: 'archive',
        totalPosts: allPosts.length,
        totalPages: maxPage,
        currentPage: currentPage,
        postData: posts,
        allTags: _.uniq(_.flatten(_.pluck(posts, 'tags')))
    }, blogContext);

    next(false, context);
};

exports.paginate = function (allPosts, maxPosts, currentPage, next) {
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
    var context = {
        blogSubtitle: posts[0].blogSubtitle,
        bodyId: 'archive',
        blogTitle: posts[0].blogTitle,
        blogAuthor: posts[0].blogAuthor,
        blogAuthorEmail: posts[0].blogAuthorEmail,
        gravatar: posts[0].gravatar,
        blogBio: posts[0].blogBio,
        rssUrl: posts[0].rssUrl,
        totalPosts: allPosts.length,
        totalPages: maxPage,
        currentPage: currentPage,
        postData: posts
    };
    next(false, context);
};

exports.paginate = function (allPosts, maxPosts, currentPage, callback) {
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
                    return callback(1);
                } else {
                    return callback(maxPage);
                }
            }
        } else {
            currentPage = 1;
            posts = allPosts.slice(0, maxPosts);
        }
    }
    var context = {
        totalPosts: allPosts.length,
        totalPages: maxPage,
        currentPage: currentPage,
        postData: posts
    };
    callback(false, context);
};

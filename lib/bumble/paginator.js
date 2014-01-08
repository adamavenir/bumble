exports.paginate = function (allPosts, req, res, callback) {

    // console.log('paginator allPosts', allPosts); 

    var posts = [],
        currentPage,
        page,
        pos,
        maxPage = Math.ceil(allPosts.length / allPosts.maxPosts);

    if (allPosts.length === 0) {
        currentPage = 1
    } else {
        if (req.query.page && !isNaN(Number(req.query.page))) {
            page = Number(req.query.page);
            if (page <= maxPage && page > 0) {
                currentPage = page;
                pos = (page - 1) * allPosts.maxPosts;
                posts = allPosts.slice(pos, pos + allPosts.maxPosts);
            } else {
                if (page <= 0) {
                    return callback(1);
                } else {
                    return callback(maxPage);
                }
            }
        } else {
            currentPage = 1;
            posts = allPosts.slice(0, allPosts.maxPosts);
        }
    }
    res.locals.totalPosts = allPosts.length;
    res.locals.totalPages = maxPage;
    res.locals.currentPage = currentPage;
    res.locals.postData = posts;
    callback()
}

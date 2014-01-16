exports.paginate = function (allPosts, maxPosts, req, res, callback) {

    var maxPage = Math.ceil(allPosts.length / maxPosts);

    var posts = [], currentPage, page, pos;

    // console.log('There\'s ' + allPosts.length +  ' posts in this set. We\'re going to slice it down to ' + maxPosts + ' per page.');         

    // console.log('maxPage:', maxPage)

    if (allPosts.length === 0) {
        currentPage = 1
    } else {
        if (req.query.page && !isNaN(Number(req.query.page))) {
            page = Number(req.query.page);
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
    res.locals.totalPosts = allPosts.length;
    res.locals.totalPages = maxPage;
    res.locals.currentPage = currentPage;
    res.locals.postData = posts;
    callback()
}

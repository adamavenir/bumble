var crypto = require('crypto');

var gravy = module.exports = {
  gravatar: function(email, size) {
    hash = crypto.createHash('md5').update(email.toLowerCase()).digest("hex");
    return '//secure.gravatar.com/avatar/' + hash + '?s=' + size;
  }
}
var fs = require('fs'),
    path = require('path'),
    configFile;

var config = module.exports = {
    file: function(configFile) {
        var configPath = (require.main ? path.dirname(require.main.filename) : ".") + '/' + configFile;
        try {
            configContents = fs.readFileSync(configPath, 'utf-8');
            var thisConfig = JSON.parse(configContents);
        } catch(e) {
            console.log('Cannot read the requested file.');
            throw e;
        }
        return thisConfig;
    }
};
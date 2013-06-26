var fs = require('fs'),
    path = require('path'),
    env = require('getconfig'),
    logger = require('bucker').createLogger(env.bucker, module),
    configFile;

var config = module.exports = {
    file: function(configFile) {
        var configPath = (require.main ? path.dirname(require.main.filename) : ".") + '/' + configFile;
        logger.debug('loading file:', configPath);
        try {
            configContents = fs.readFileSync(configPath, 'utf-8');
            var thisConfig = JSON.parse(configContents);
            logger.debug('loaded config file');
        } catch(e) {
            logger.error('Cannot read the requested file.');
            throw e;
        }
        return thisConfig;
    }
};

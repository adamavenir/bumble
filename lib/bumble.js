function Bumble (app, options) {
	this.app = app;
};

module.exports = function (app, options) {
	return new Bumble(app, options);
	logger.log('bumble');
}
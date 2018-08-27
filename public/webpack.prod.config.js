const path = require('path');

module.exports = {
	entry: path.resolve(__dirname, 'js/main.js'),
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'js/')
	},
	module: {
		rules: []
	},
	resolve: {
		extensions: []
	},
	mode: 'production'
}

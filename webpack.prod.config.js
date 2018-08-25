const path = require('path');

module.exports = {
	entry: './public/js/main.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public/js/')
	},
	module: {
		rules: []
	},
	resolve: {
		extensions: []
	},
	mode: 'production'
}

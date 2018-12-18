const path = require('path');

module.exports = {
	entry: path.resolve(__dirname, 'js/main.js'),
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'js/')
	},
	/*mode: 'production'*/
	devtool: 'inline-source-map',
	mode: 'development'
}

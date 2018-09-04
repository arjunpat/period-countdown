const path = require('path');

// polyfill: https://github.com/babel/babel/issues/7254

module.exports = {
	entry: ['whatwg-fetch', path.resolve(__dirname, 'js/main.js')],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'js/')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	mode: 'production'
}

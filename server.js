/**
 * bell-countdown
 * Copyright(c) 2018 Arjun Patrawala
 * MIT Licensed
 */

'use strict';

//process.env.NODE_ENV = 'production';
console.time('startup');
const http = require('http');

// cache of local files
const cache = require('./app/cache.js');
const utils = require('./app/utils.js');

const server = http.createServer((req, res) => {

	var path = utils.parseURL(req.url);
	console.log(path);

	if (path.layers[0] === 'api') {

		res.end('hi');


	} else { // if is a static file

		cache.getFile(path.pathname).then((file) => {
			console.log(file);
			res.writeHead(200, utils.mergeHeaders(file.headers));
			res.end(file.content);

		}).catch((err) => {
			console.log(err);

			// handle 404 errors
			cache.getFile('/404.html').then((file) => {

				res.writeHead(404, utils.mergeHeaders(file.headers));
				res.end(file.content);
			
			});
		});

	}


}).listen(8080, () => {
	console.timeEnd('startup');
});
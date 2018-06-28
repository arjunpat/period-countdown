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

// homemade utility class
const utils = require('./app/utils.js');

// entire api
const api = require('./app/api/api.js');

const server = http.createServer((req, res) => {

	let path = utils.parseURL(req.url);
	console.log(path);

	if (path.layers[0] === 'api') {
		
		api(req, res, path).then(data => {
			if (data.valid) {

				res.writeHead(200, data.headers);
				res.end(data.content);

			} else {

				res.end(JSON.stringify({
					success: false,
					error: 'bad_request'
				}));

			}
		}).catch(err => {
			res.end(JSON.stringify({
				success: false,
				error: 'bad_request'
			}));
			console.log(err);
		});

	} else { // if is a static file

		cache.getFile(path.path).then(file => {
			res.writeHead(200, utils.mergeHeaders(file.headers));
			res.end(file.content);

		}).catch((err) => {
			console.log(err);

			// handle 404 errors
			cache.getFile('/').then(file => { res.writeHead(404, utils.mergeHeaders(file.headers));res.end(file.content) });
		});

	}


}).listen(8080, () => {
	console.timeEnd('startup');
});
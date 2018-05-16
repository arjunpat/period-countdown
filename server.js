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
//const api = require('./app/api.js');

const server = http.createServer((req, res) => {

	var path = utils.parseURL(req.url);
	console.log(path);

	if (path.layers[0] === 'api') {

		switch (path.layers[1]) {
			case 'time':

				let json = {
					success: true,
					data: {
						ms: Date.now()
					}
				}
				//setTimeout(() => res.end(JSON.stringify(json)), 1432);
				res.end(JSON.stringify(json));

				break;
			case 'schedule':
				break;
			case 'presets':
				break;
			case 'v1':
				if (req.method = 'POST') {

					// wait for post data
					var postData = '';

					req.on('data', (chunk) => { postData += chunk.toString() });

					req.on('end', () => {
						try {
							postData = JSON.parse(postData);
						} catch (e) {
							res.end(JSON.stringify({
								success: false,
								error: 'unable_to_read_request'
							}));
							return;
						}

						/*api(req, path.layers).then((val) => {

							res.writeHead(200, val.headers);
							res.end(val.content);

						});*/

					});

					break;
				}

			default:
				cache.getFile('/404.html').then((file) => {res.writeHead(404, utils.mergeHeaders(file.headers));res.end(file.content)});

		}
		

	} else { // if is a static file

		cache.getFile(path.path).then((file) => {
			res.writeHead(200, utils.mergeHeaders(file.headers));
			res.end(file.content);

		}).catch((err) => {
			console.log(err);

			// handle 404 errors
			cache.getFile('/404.html').then((file) => {res.writeHead(404, utils.mergeHeaders(file.headers));res.end(file.content)});
		});

	}


}).listen(8080, () => {
	console.timeEnd('startup');
});
/**
 * period-countdown
 * Copyright(c) 2018 Arjun Patrawala
 * MIT Licensed
 */

'use strict';

require('dotenv').config();

console.time('startup');
const http = require('http');
const cache = require('./lib/cache.js');
const utils = require('./lib/utils.js');
const api = require('./lib/api/api.js');

const server = http.createServer((req, res) => {

	let path = utils.parseURL(req.url);
	//console.log(path);

	if (path.layers[0] === 'api') {
		api(req, res, path).then(data => {
			if (data.valid) {
				res.writeHead(200, utils.mergeHeaders(data.headers));
				res.end(data.content);
			} else {
				res.writeHead(200, utils.mergeHeaders({}));
				res.end(JSON.stringify({
					success: false,
					error: 'bad_request'
				}));
			}
		}).catch(err => {
			res.writeHead(200, utils.mergeHeaders({}));
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

}).listen(process.env.PORT, () => {
	console.timeEnd('startup');
});

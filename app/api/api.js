"use strict";
const v1 = require('./v1.js');


// get requests
'GET /api/time';
'GET /api/schedule';
'GET /api/presets';


module.exports = async (req, res, path) => {


	switch (path.layers[1]) {
		case 'time':

			return {
				valid: true,
				headers: {
					'Content-Type': 'application/json'
				},
				content: {
					success: true,
					data: {
						ms: Date.now()
					}
				}
			}

			break;
		case 'schedule':
			break;
		case 'presets':
			break;
		case 'v1':

			// TODO: add restrictions on who can access api and how can access
			if (req.method = 'POST') {

				// wait for post data
				var postData = '';

				req.on('data', chunk => {
					postData += chunk.toString();

					// TODO figure out max possible request size
					if (postData.length > 2000) throw new Error('request_overflow');

				});

				req.on('end', () => {

					postData = JSON.parse(postData);

					return v1(path.path.substring(7, path.path.length), postData);

				});

				break;
			}

		default:
			return { valid: false };
	}

}
"use strict";
const v1 = require('./v1.js');
const timingData = require('./timing-data.js');


// get requests
'GET /api/time';
'GET /api/schedule';
'GET /api/presets';


module.exports = (req, res, path) => new Promise((resolve, reject) => {

	switch (path.layers[1]) {
		case 'time':

			resolve({
				valid: true,
				headers: {
					'Content-Type': 'application/json'
				},
				content: JSON.stringify({
					success: true,
					data: {
						ms: Date.now() - 14400000
					}
				})
			});

			break;
		case 'calendar':

			resolve({
				valid: true,
				headers: timingData.calendar.headers,
				content: timingData.calendar.data
			});

			break;
		case 'presets':

			resolve({
				valid: true,
				headers: timingData.presets.headers,
				content: timingData.presets.data
			});

			break;
		case 'v1':

			// TODO: add restrictions on who can access api and how can access
			if (req.method = 'POST') {

				// wait for post data
				let postData = '';

				req.on('data', chunk => {
					postData += chunk.toString();

					// TODO figure out max possible request size
					if (postData.length > 2000) reject('request_overflow');

				});

				req.on('end', () => {

					try {
						postData = JSON.parse(postData);
					} catch (e) {
						resolve({ valid: false });
					}

					return v1(path.path.substring(7, path.path.length), postData).then(data => resolve(data)).catch(err => reject(err));

				});

				break;
			}

		default:
			resolve({ valid: false });
	}

})
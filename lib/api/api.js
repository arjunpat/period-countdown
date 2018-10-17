'use strict';
const v2 = require('./v2.js');
const version = (process.env.NODE_ENV === 'production') ? require('../../package.json').version : '0.4.2';

const timingData = (process.env.NODE_ENV === 'production') ? require('../../../timing-data') : require('./timing-data');


module.exports = (req, res, path) => new Promise((resolve, reject) => {

	switch (path.layers[1]) {
		case 'time':

			return resolve({
				valid: true,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate'
				},
				content: JSON.stringify({
					success: true,
					data: {
						ms: Date.now() - (5 * 60 * 60 * 1000)
					}
				})
			});

		case 'schedule':

			if (path.layers[2] && typeof timingData[path.layers[2]] === 'object') {
				return resolve({
					valid: true,
					headers: {
						'Cache-control': 'max-age=600',
						'Content-type': 'application/json; charset=UTF-8'
					},
					content: timingData[path.layers[2]].schedule
				});
			}

			return resolve({ valid: false });

		case 'school':

			if (path.layers[2] && typeof timingData[path.layers[2]] === 'object') {
				return resolve({
					valid: true,
					headers: {
						'Cache-control': 'max-age=43200',
						'Content-type': 'application/json; charset=UTF-8'
					},
					content: timingData[path.layers[2]].school
				});
			}

			return resolve({ valid: false });

		case 'schools':

			return resolve({
				valid: true,
				headers: {
					'Cache-control': 'max-age=43200',
					'Content-type': 'application/json; charset=UTF-8'
				},
				content: timingData.schools
			});

		case 'version':
			
			return resolve({
				valid: true,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate'
				},
				content: JSON.stringify({
					success: true,
					data: {
						version
					}
				})
			});

		case 'v2':

			if (req.method = 'POST') {

				// wait for post data
				let postData = '';

				req.on('data', chunk => {
					postData += chunk.toString();

					// TODO figure out max possible request size
					if (postData.length > 2000)
						reject('request_overflow');

				});

				req.on('end', () => {

					try {
						postData = JSON.parse(postData);
					} catch (e) {
						resolve({ valid: false });
					}

					return v2(path.path.substring(7, path.path.length), postData).then(data => resolve(data)).catch(err => reject(err));
				});

				break;
			}

		default:
			return resolve({ valid: false });
	}

})

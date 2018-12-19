/**
 * period-countdown
 * Copyright(c) 2019 Arjun Patrawala
 * MIT Licensed
 */

'use strict';

require('dotenv').config();

console.time('startup');
const express = require('express');
const app = express();
const utils = require('./lib/utils');
const cache = require('./lib/cache');

app.use(express.json());
app.use('/api', require('./lib/api/api'));

app.all('*', (req, res) => {

	// i don't like express's servestatic function
	cache.getFile(req.path).then(file => {
		res.set(utils.mergeHeaders(file.headers));
		res.send(file.content);
	}).catch(err => {
		console.log(err);
		cache.getFile('/').then(file => { res.set(utils.mergeHeaders(file.headers)); res.send(file.content); });
	});
});

app.listen(process.env.PORT, () => console.timeEnd('startup'));

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
app.set('etag', false);
app.set('x-powered-by', false);

app.use((req, res, next) => {
	res.set({
		'Server': 'Spice',
		'Access-Control-Allow-Origin': process.env.CHROME_EXTENSION,
		'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With'
	});

	next();
});

app.use('/api', require('./lib/api/api'));

app.all('*', (req, res) => {

	// i don't like express's servestatic function
	cache.getFile(req.path).then(file => {
		res.set(file.headers);
		res.send(file.content);
	}).catch(err => {
		console.log(err);
		cache.getFile('/').then(file => { res.set(file.headers); res.send(file.content); });
	});
});

app.listen(process.env.PORT, () => console.timeEnd('startup'));

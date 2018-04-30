/**
 * bell-countdown
 * Copyright(c) 2018 Arjun Patrawala
 * MIT Licensed
 */

'use strict';

//process.env.NODE_ENV = 'production';
const appStartTime = Date.now();
const express = require('express');
const app = express();

// cache of local files
const cache = require('./app/cache.js');

// app config
app.set('etag', false);


// app middleware
app.use(express.json());

app.use((req, res, next) => {
	res.set({
		'X-Powered-By': 'SavageScript/1.0',
		'Server': 'WebServer'
	});
	return next();
});
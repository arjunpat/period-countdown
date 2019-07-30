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

app.use(express.json());
app.use(require('cookie-parser')());
app.set('etag', false);
app.set('x-powered-by', false);

app.use((req, res, next) => {
  res.set({
    'Server': 'Spice',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  });

  if (req.headers.origin)
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);

  next();
});

app.use('/', require('./routes/api'));

app.listen(process.env.PORT, () => console.timeEnd('startup'));

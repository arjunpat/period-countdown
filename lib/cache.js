"use strict";
const fs = require('fs');
const utils = require('./utils.js');

const urlMap = {
	'/': '/index.html',
	'/settings': '/index.html',
	'/favicon.ico': '/images/1024.png',
	'/sw.js': '/js/sw.js'
}

const headerPresets = {
	js: {
		'Content-Type': 'application/javascript; charset=utf-8',
		'Cache-Control': 'public, max-age=31536000' // 1 year
	},
	css: {
		'Content-Type': 'text/css; charset=utf-8',
		'Cache-Control': 'public, max-age=31536000'
	},
	html: {
		'Content-Type': 'text/html; charset=utf-8',
		'Cache-Control': 'public, max-age=0'
	},
	png: {
		'Content-Type': 'image/png',
		'Cache-Control': 'public, max-age=31536000',
		'Accept-ranges': 'bytes'
	},
	json: {
		'Content-Type': 'application/json; charset=utf-8',
		'Cache-Control': 'public, max-age=31536000'
	}
}

const filePresets = {
	'/js/sw.js': {
		'Cache-Control': 'public, max-age=0'
	},
	'/extension-connection.html': {
		'Cache-Control': 'public, max-age=31536000'
	},
	'/index.html': {
		'Cache-Control': 'public, max-age=3600'
	}
}

class Cache {

	constructor(cacheTime) {
		this.files = {};
		this.cacheTime = cacheTime;
	}

	getFile(filename) {

		return new Promise((resolve, reject) => {
			if (urlMap[filename]) filename = urlMap[filename];

			filename = __dirname + '/../public' + filename;

			if (this.files[filename]) {

				// if 15 min old
				if (Date.now() - this.files[filename].lastLoad > this.cacheTime) this.addFile(filename);

			} else {

				this.addFile(filename);
			}

			resolve({
				content: this.files[filename].content,
				headers: this.files[filename].headers
			});
		});

	}

	addFile(filename) {

		let reg = filename.match(/[^\\]*\.(\w+)$/);
		let encoding = 'utf8';
		let headers = {};

		if (reg && reg[1])
			headers = clone(headerPresets[reg[1]]);

		let theFile = filename.substring(filename.indexOf('public') + 6, filename.length);

		if (filePresets[theFile]) {
			utils.updateObjectWithValues(headers, clone(filePresets[theFile]));
		}

		if (reg && reg[1] === 'png') encoding = undefined;

		// if file not found, will throw error and catch the promise
		this.files[filename] = {
			content: fs.readFileSync(filename, encoding),
			lastLoad: Date.now(),
			headers
		}
	}

}

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

module.exports = new Cache(process.env.STATIC_CACHE_TIME);

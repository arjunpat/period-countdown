"use strict";
const fs = require('fs');

const urlMap = {
	'/': '/index.html',
	'/settings': '/index.html',
	'/favicon.ico': '/images/1024.png',
	'/sw.js': '/js/sw.js'
};

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
		'Cache-Control': 'max-age=3600'
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
};

const filePresets = {
	'/js/sw.js': {
		'Cache-Control': 'public, max-age=900' // 15 minutes
	}
};

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
				//console.log('file was found');

				// if 15 min old
				if (Date.now() - this.files[filename].lastLoad > this.cacheTime) this.addFile(filename);

			} else {
				//console.log('not found');

				this.addFile(filename);
			}

			resolve({
				content: this.files[filename].content,
				headers: this.files[filename].headers
			});
		});

	}

	addFile(filename) {
		//console.log('file added');

		let reg = filename.match(/[^\\]*\.(\w+)$/);

		let encoding = 'utf8';
		let stats = fs.statSync(filename);

		let headers = {
			Date: (new Date(stats.mtime)).toString()
		};

		if (reg[1]) headers = headerPresets[reg[1]];
		if (reg[1] === 'png') encoding = undefined;

		// if file not found, will throw error and catch the promise
		this.files[filename] = {
			content: fs.readFileSync(filename, encoding),
			lastLoad: Date.now(),
			headers
		};
	}

}


module.exports = new Cache(/*900000*/0);

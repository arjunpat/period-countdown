"use strict";
const fs = require('fs');

const url_map = {
	'/': '/index.html',
	'/settings': '/index.html',
	'/favicon.ico': '/images/1024.png'
}

const header_presets = {
	js: {
		'Content-Type': 'application/javascript; charset=UTF-8',
		'Cache-Control': 'public, max-age=31536000'
	},
	css: {
		'Content-Type': 'text/css; charset=UTF-8',
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
	}
}

class Cache {

	constructor() {
		this.files = {};
	}

	getFile(filename) {

		return new Promise((resolve, reject) => {
			if (url_map[filename]) filename = url_map[filename];

			filename = __dirname + '/../public' + filename;

			if (this.files[filename]) {
				//console.log('file was found');

				// if 15 min old
				if (Date.now() - this.files[filename].lastLoad > 900000) this.addFile(filename);

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

		var reg = filename.match(/[^\\]*\.(\w+)$/);

		var encoding = 'utf8';
		var stats = fs.statSync(filename);

		if (reg[1]) var headers = header_presets[reg[1]];
		if (reg[1] === 'png') encoding = undefined;
		headers.Date = new Date(stats.mtime).toString();

		// if file not found, will throw error and catch the promise
		this.files[filename] = {
			content: fs.readFileSync(filename, encoding),
			lastLoad: Date.now(),
			headers
		}
	}

}


module.exports = new Cache();
const fs = require('fs');

var cacheFunc = (filename) => {
	var content = fs.readFileSync(filename);
	var lastLoad = Date.now();

	return () => {

		if (Date.now() - lastLoad > 900000) { // 15 min old

			content = fs.readFileSync(filename);
			lastLoad = Date.now();

		}

		return content;

	}
}

class Cache {
	constructor(directory) {

	}
	getFile(filename) {

	}
}

module.exports = new Cache();
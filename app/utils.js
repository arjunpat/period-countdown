class Utils {
	constructor() {}

	mergeObjects(object1, object2) {

		for (var key in object2) 
			if (object2.hasOwnProperty(key))
				object1[key] = object2[key];
		return object1;
	}

	mergeHeaders(headers) {
		return this.mergeObjects({
			'Server': 'Spice',
			'X-Powered-By': 'SavageScript/1.0'
		}, headers);
	}

	parseURL(url) {
		console.time('time-to-parse-url');

		var indexOfSearch = url.indexOf('?')
		if (indexOfSearch === -1) indexOfSearch = url.length;

		var path = url.substring(0, indexOfSearch);
		var search = url.substring(indexOfSearch + 1, url.length);
		var layers = path.split('/');

		layers = layers.filter((val) => {
			return val !== '';
		});

		console.timeEnd('time-to-parse-url');

		return {
			path,
			search,
			layers
		}
	}
}


module.exports = new Utils();
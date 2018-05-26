"use strict";
class Utils {
	constructor() {
		this.alphaNumerics = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	}

	mergeObjects(object1, object2) {

		for (var key in object2) 
			if (object2.hasOwnProperty(key))
				object1[key] = object2[key];
		return object1;
	}

	updateObjectWithValues(main, augment) {
		for (var key in main)
			if (main.hasOwnProperty(key) && augment.hasOwnProperty(key))
				main[key] = augment[key];
		return main;
	}

	areObjectStringsShorterThan(arr, length) {
		for (var key in arr)
			if (arr.hasOwnProperty(key) && arr[key].length >= length)
				return false;
		return true;
	}

	mergeHeaders(headers) {
		return this.mergeObjects({
			'Server': 'Spice',
			'X-Powered-By': 'SavageScript/1.0'
		}, headers);
	}

	parseURL(url) {

		var indexOfSearch = url.indexOf('?')
		if (indexOfSearch === -1) indexOfSearch = url.length;

		var path = url.substring(0, indexOfSearch);
		var search = url.substring(indexOfSearch + 1, url.length);
		
		var layers = path.split('/').filter((val) => {
			return val !== '';
		});

		return {
			path,
			search,
			layers
		}
	}

	generateRandomID(length) {
		var id = '';

		for (var i = 0; i < length; i++)
			id += this.alphaNumerics[Math.floor(Math.random() * 62)];

		return id;

	}
}

module.exports = new Utils();
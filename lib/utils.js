"use strict";
class Utils {
	constructor() {
		this.alphaNumerics = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	}

	mergeObjects(object1, object2) {

		for (let key in object2)
			if (object2.hasOwnProperty(key))
				object1[key] = object2[key];
		return object1;
	}

	updateObjectWithValues(main, augment) {
		for (let key in main)
			if (main.hasOwnProperty(key) && augment.hasOwnProperty(key))
				main[key] = augment[key];
		return main;
	}

	areObjectStringsShorterThan(arr, length) {
		for (let key in arr)
			if (arr.hasOwnProperty(key) && arr[key].length >= length)
				return false;
		return true;
	}

	removeEveryOtherElementFromArray(arr, startingAt = 0) {
		for (let i = startingAt; i < arr.length; i++)
			arr.splice(i, 1);
		return arr;
	}

	mergeHeaders(headers) {
		return this.mergeObjects({
			'Server': 'Spice',
			'Access-Control-Allow-Origin': process.env.CHROME_EXTENSION,
			'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With'
		}, headers);
	}

	parseURL(url) {

		let indexOfSearch = url.indexOf('?')
		if (indexOfSearch === -1) indexOfSearch = url.length;

		let path = url.substring(0, indexOfSearch);
		let search = url.substring(indexOfSearch + 1, url.length);

		let layers = path.split('/').filter(val => val !== '');

		return {
			path,
			search,
			layers
		}
	}

	generateRandomID(length) {
		let id = '';

		for (let i = 0; i < length; i++)
			id += this.alphaNumerics[Math.floor(Math.random() * 62)];

		return id;
	}
}

module.exports = new Utils();

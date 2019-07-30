const fs = require('fs');
const { split, seek, combine, getArray } = require('./LexerTools.js');

class Parser {
	static schedule(text) {
		let obj = {};

		let blockSeperator = [':', '-'];
		let seperators = [...blockSeperator, ' ', '\n', '"'];
		let arr = split(text, seperators);

		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === '-') { // setting
				i += 2;
				let key = arr[i++];

				let [values, updatedCursor] = getArray(arr, blockSeperator, i);
				i = updatedCursor;

				obj[key] = values;
			}
		}

		obj.calendar = this.parseCalendarArray(obj.calendar);
		obj.defaults = {
			pattern: obj.pattern,
			start: obj.pattern_start[0]
		}
		delete obj.pattern_start;
		delete obj.pattern;

		return obj;
	}

	static parseCalendarArray(arr) {
		let data = [];

		for (let i = 0; i < arr.length; i++) {
			let pieces = arr[i].split('"');
			let n;

			if (pieces.length === 3) { // custom name
				arr[i] = pieces[0].trim();
				n = pieces[1];
			}

			pieces = arr[i].split(' ');
			let t = pieces[1];
			let from, to, date;

			if (pieces[0].includes('~')) {
				pieces = pieces[0].split('~');
				from = pieces[0];
				to = pieces[1];
			} else {
				date = pieces[0];
			}

			data.push({
				date,
				to,
				from,
				content: {
					n,
					t
				}
			});
		}

		return data;
	}

	static school(text) {
		let obj = {
			presets: {}
		}

		let blockSeperator = ['-', '#'];
		let seperators = [...blockSeperator, ' ', '\n', '"'];
		let arr = split(text, seperators);

		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === '-') { // setting
				i += 2;
				let key = arr[i++];

				let [values, updatedCursor] = getArray(arr, blockSeperator, i);
				i = updatedCursor;

				obj[key] = values;
			} else if (arr[i] === '#') { // schedule
				i += 2;
				let key = arr[i];
				let from = seek(arr, i, '"');
				i = seek(arr, from, '"');
				let n = combine(arr, from + 1, i - 1);

				i += 2;

				let [s, updatedCursor] = getArray(arr, blockSeperator, i);
				i = updatedCursor;

				obj.presets[key] = {
					n,
					s: (s && s.join(',')) || s
				}
			}
		}

		return obj;
	}
}

module.exports = Parser;
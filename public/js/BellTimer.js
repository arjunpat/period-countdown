"use strict";

class BellTimer {

	constructor() {
		this.calendar = {};
		this.schedule = [];
		this.presets = {};
		this.offset = 0;
		

	}

	parseCalendar(calendar) {

		for (let i = 0; i < calendar.length; i++) {
			let cache = calendar[i];

			if (cache.date) {

				this.calendar[cache.date] = cache.content;

			} else if (cache.from && cache.to) {

				let date = cache.from;
				let to = this.getNextDayDateString(cache.to);

				do {

					this.calendar[date] = cache.content;

					date = this.getNextDayDateString(date);

				} while (date !== to);

			}
		}
	}

	parseDay(dateString) {
		if (this.calendar[dateString]) {

			let cache = this.calendar[dateString];
			let {type, name} = cache;

			if (type && this.presets[type.toUpperCase()]) {
				type = type.toUpperCase();
				this.calendar[dateString].schedule = this.presets[type].schedule;
				if (!name) this.calendar[dateString].name = this.presets[type].name;
			}

		}
	}

	calculateOffset(numOfRequests) {

		if (!numOfRequests) throw 'Missing arguments';

		var offsets = [];

		for (let i = 0; i < numOfRequests; i++) {

			setTimeout(() => {

				RequestManager.getTime().then(time => {

					offsets.push(time - Date.now());

					let temp = 0;
					for (let i = 0; i < offsets.length; i++) temp += offsets[i];


					this.offset = Math.round(temp / offsets.length);
					/*console.log(this.offset);
					console.log(offsets);*/

				});

			}, 1000 * i);
		}

	}

	getCurrentTime() { return this.offset + Date.now(); }

	getDateStringFromDateObject(dateObject) {
		return (dateObject.getMonth() + 1) + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
	}

	getDateObjectFromDateString(dateString) {
		var a = dateString.split('/');
		return new Date(a[2], (parseInt(a[0]) - 1), a[1], 0, 0, 0, 0);
	}

	getNextDayDateString(dateString) {
		return this.getDateStringFromDateObject(new Date(this.getDateObjectFromDateString(dateString).getTime() + 8.64e7));
	}

}
"use strict";

class BellTimer {

	constructor() {
		this.offset = 0;
	}

	calculateOffset(numOfRequests) {

		if (!numOfRequests) throw "Missing arguments";

		var offsets = [];

		for (let i = 0; i < numOfRequests; i++) {

			setTimeout(() => {

				RequestManager.getTime().then(time => {

					offsets.push(time - Date.now());

					let temp = 0;
					for (let i = 0; i < offsets.length; i++) temp += offsets[i];


					this.offset = temp / offsets.length;
					console.log(this.offset);
					console.log(offsets);

				});

			}, 1000 * i);
		}

	}

	getOffest() {
		return this.offset;
	}

}
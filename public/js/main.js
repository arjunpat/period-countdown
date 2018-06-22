"use strict";

var bellTimer;

Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
	bellTimer = new BellTimer(values[0], values[1]);


	let bellLoop = () => {
		//bellTimer.getTimeLeftString();
	}

	bellLoop();
	//setInterval(bellLoop, 50);



});

"use strict";

var bellTimer;

var bellLoop = () => {
	console.log(bellTimer.getRemainingTime());

	setTimeout(bellLoop, 1e3);
}


Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
	let [presets, calendar] = values;

	bellTimer = new BellTimer(presets, calendar);

	bellLoop();

});
"use strict";

var bellTimer = new BellTimer();

Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
	bellTimer.presets = values[0];
	console.time('bellsetup');
	bellTimer.parseCalendar(values[1]);
	bellTimer.prepareSchedule();
	console.timeEnd('bellsetup');
	console.log(bellTimer.calendar)
	console.log(bellTimer.schedule);
});


let bellLoop = () => {
	bellTimer.calculateOffset(5);
	//bellTimer.getTimeLeftString();
}

bellLoop();
//setInterval(bellLoop, 50);
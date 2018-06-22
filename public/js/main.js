"use strict";

var bellTimer = new BellTimer();

Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
	bellTimer.presets = values[0];
	bellTimer.parseCalendar(values[1]);
});


let bellLoop = () => {
	bellTimer.calculateOffset(5);
	//bellTimer.getTimeLeftString();
}

bellLoop();
//setInterval(bellLoop, 50);
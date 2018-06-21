"use strict";

var bellTimer = new BellTimer();


RequestManager.getPresets().then(data => {
	bellTimer.presets = data;
	
	return RequestManager.getCalendar();
}).then(data => {
	bellTimer.parseCalendar(data);
});


let bellLoop = () => {
	bellTimer.calculateOffset(5);
	//bellTimer.getTimeLeftString();
}

bellLoop();
//setInterval(bellLoop, 50);
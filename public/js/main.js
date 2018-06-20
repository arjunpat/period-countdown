"use strict";

var bellTimer = new BellTimer();


RequestManager.getCalendar().then(data => {
	bellTimer.parseCalendar(data);
});


let bellLoop = () => {
	bellTimer.calculateOffset(5);
	//bellTimer.getTimeLeftString();
}

bellLoop();
//setInterval(bellLoop, 50);
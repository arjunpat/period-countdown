"use strict";

var bellTimer = new BellTimer();


let bellLoop = () => {
	bellTimer.calculateOffset(5);
	//bellTimer.getTimeLeftString();
}

bellLoop();
//setInterval(bellLoop, 50);
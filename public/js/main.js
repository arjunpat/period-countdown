console.time('setup');

var bellTimer, elements, analytics, prefManager;

// instatiate classes
elements = new Elements();
analytics = new Analytics();
prefManager = new PrefManager();

var mainLoop = () => {

	let time = bellTimer.getRemainingTime();
	//console.log(time);
	let {percent_completed, days, hours, minutes, seconds, period_name, day_type} = time;

	// make time human readable
	if (seconds < 10) seconds = '0' + seconds;
	if (minutes < 10 && hours !== 0) minutes = '0' + minutes;
	let timeString = '';
	if (hours !== 0) timeString = `${hours}:`;
	timeString += `${minutes}:${seconds}`;


	// update screen
	if (document.hasFocus()) {
		elements.updateProgressBar(percent_completed);
		elements.updateDayTypeText(day_type);
		elements.updateCurrentPeriodText(period_name);
		elements.updateTimeLeft(timeString);
	}
	elements.updateDocumentTitle(`${timeString} | ${period_name}`);


	// do this again
	setTimeout(mainLoop, 1000);
}

// get the calendar and presets from api
Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
	let [presets, calendar] = values;

	bellTimer = new BellTimer(presets, calendar);
	
	elements.updateElementsWithPreferences(prefManager.getAllPreferences()); // before first paint
	mainLoop();
	elements.updateScreenFontSize();
	//elements.hidePreloader();


	console.timeEnd('setup');
});

//console.timeEnd('setup');

window.onresize = () => {
	elements.updateScreenFontSize();
	elements.dimensionCanvas();
	let dimension = Math.min(window.innerHeight, window.innerWidth);
}
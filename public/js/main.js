console.time('setup');

var bellTimer, elements, analytics, prefManager;

// instatiate classes
elements = new Elements();
analytics = new Analytics();
prefManager = new PrefManager();

var mainLoop = () => {

	let time = bellTimer.getRemainingTime();

	elements.updateScreen(time);


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
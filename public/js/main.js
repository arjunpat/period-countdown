console.time('setup');

var bellTimer, elements, analytics, prefManager;

// instatiate classes
elements = new Elements();
analytics = new Analytics();
prefManager = new PrefManager();

var mainLoop = () => {

	let time = bellTimer.getRemainingTime();

	time.period_name = prefManager.getPeriodName(time.period_name) || time.period_name;

	elements.updateScreen(time);


	setTimeout(mainLoop, 50);
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
}).catch(err => {
	//elements.showErrorScreen();
	RequestManager.sendError({
		where: 'browser',
		type: 'client_page_load',
		description: err.stack
	});
	console.log(err);
});

//console.timeEnd('setup');

window.onresize = () => {
	elements.updateScreenFontSize();
	elements.dimensionCanvas();
}
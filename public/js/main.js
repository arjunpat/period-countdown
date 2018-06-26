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

	return RequestManager.init();
}).then(data => {
	// now the not-as-crucial stuff
	console.log(data);

}).catch(err => {
	//elements.showErrorScreen();
	RequestManager.sendError({
		where: 'browser',
		type: 'client_page_load',
		description: err.stack
	});
});

//console.timeEnd('setup');

window.onresize = () => {
	elements.updateScreenFontSize();
	elements.dimensionCanvas();
}

var googleApiDidLoad = () => {

	gapi.load('auth2', () => {
		gapi.auth2.init({
			client_id: '989074405041-k1nns8p3h7eb1s7c6e3j6ui5ohcovjso.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope: 'profile email'
		}).then(GoogleAuth => {
			return GoogleAuth.signIn({
				scope: 'profile email'
			});
		}).then(data => {
			let account = {
				email: data.w3.U3,
				first_name: data.w3.ofa,
				last_name: data.w3.wea,
				profile_pic: data.w3.Paa
			}
			window.localStorage.account = JSON.stringify(account);
			return RequestManager.login(account);
		}).then(data => {
			if (data.success) {
				
			} else {
				window.alert('Our servers are having a bad day. Please try again another time.');
			}
		}).catch(e => {
		});
	});

}
import Canvas from '../../../public/js/components/Canvas.js';
import Logger from '../../../public/js/Logger';

export default class ExtnView {
	constructor() {

		Logger.time('View', 'grabbed-elements');

		this.currentValues = {};
		this.root = document.getElementById('root');

		this.preloader = document.getElementById('preloader');

		this.index = {
			mainCanvas: document.getElementById('main-canvas'),
			mainCanvasOverlay: document.getElementById('main-canvas-overlay'),
			dayType: document.getElementById('day-type'),
			currentPeriodText: document.getElementById('current-period-text'),
			timeLeft: document.getElementById('time-left'),
			settingsButton: document.getElementById('settings-button'),
			googleSignin: document.getElementById('google-signin'),
			scheduleTable: document.getElementById('schedule-table')
		}

		window.innerWidth = 400;
		window.innerHeight = 400;
		this.canvas = new Canvas(this.index.mainCanvas);

		Logger.timeEnd('View', 'grabbed-elements');
	}

	updateScreen(time) {


		let {percentCompleted, hours, minutes, seconds, periodName, dayType} = time;

		// make time human readable
		seconds = padNum(seconds);
		if (hours !== 0)
			minutes = padNum(minutes);

		let timeString = '';
		if (hours !== 0)
			timeString = `${hours}:`;

		timeString += `${minutes}:${seconds}`;

		// update the dom

		if (
			(percentCompleted < 1 && this.canvas.props.decimalCompleted <= .1 && !this.canvas.animationInterval)
			|| (percentCompleted > 99 && this.canvas.props.decimalCompleted >= .99)
		) {
			this.canvas.draw(percentCompleted / 100); // more specific at the beginning or end
		} else if (!this.canvas.animationInterval) {
			this.canvas.animate(Math.floor(percentCompleted) / 100, 2);
		}

		if (this.currentValues.dayTypeText !== dayType) {
			this.index.dayType.innerText = dayType;
			this.currentValues.dayTypeText = dayType;
			this.updateScreenDimensions();
		}

		if (this.currentValues.currentPeriodText !== periodName) {
			this.index.currentPeriodText.innerText = periodName;

			// animation
			this.index.currentPeriodText.style.animation = '.6s updatePeriod'
			setTimeout(() => this.index.currentPeriodText.style.animation = 'none', 1e3);
			this.currentValues.currentPeriodText = periodName;
			this.updateScreenDimensions();
		}

		if (this.currentValues.timeLeftText !== timeString) {
			this.index.timeLeft.innerText = timeString;
			this.currentValues.timeLeftText = timeString;
		}
	}

	updateViewWithState(values) {
		// theme stuff
		this.canvas.updateColors(values.theme.background, values.theme.completed);
		this.index.mainCanvasOverlay.style.color = values.theme.text;
		this.index.settingsButton.querySelector('div').style.background = values.theme.text;

		if (typeof values.theme.background === 'object') {
			this.index.settingsButton.querySelector('div > i').style.color = values.theme.background.stops[values.theme.background.stops.length - 1];
		} else {
			this.index.settingsButton.querySelector('div > i').style.color = values.theme.background;
		}

		if (values.googleAccount.signed_in) {
			this.index.googleSignin.querySelector('button').style.display = 'none';
			this.index.googleSignin.querySelector('div > img').src = values.googleAccount.profile_pic + '?sz=70';
			this.index.googleSignin.querySelector('div > img').style.display = 'block';
		} else {
			this.index.googleSignin.querySelector('button').style.display = '';
			this.index.googleSignin.querySelector('div > img').src = '';
			this.index.googleSignin.querySelector('div > img').style.display = '';
		}

	}

	hidePreloader() {

		if (this.preloader.style.display !== 'none') {

			this.preloader.querySelector('div').style.opacity = '0';
			this.preloader.style.opacity = '0';
			this.preloader.style.pointerEvents = 'none';
			setTimeout(() => {
				this.preloader.style.display = 'none';
			}, 2000);

		}

	}

	updateScreenDimensions() {
		let dimension = window.innerWidth;
		this.index.dayType.parentElement.style.fontSize = Math.min(50, (dimension / this.index.dayType.parentElement.innerText.length) / .6) + 'px';
		this.index.timeLeft.style.fontSize = Math.min(120, dimension / (this.index.timeLeft.innerText.length - 2)) + 'px';
	}


	switchTo(id) {
		let screens = this.root.children;

		for (let i = 0; i < screens.length; i++) {
			if (screens[i].id === id) {
				screens[i].style.display = 'block';
				setTimeout(() => { screens[i].style.opacity = '1'; }, 20);
			} else {
				screens[i].style.opacity = '0';
				setTimeout(() => { screens[i].style.display = 'none'; }, 200);
			}
		}
	}
}

// helper functions
function padNum(n) {
	if (n < 10)
		return '0' + n;
	return n;
}
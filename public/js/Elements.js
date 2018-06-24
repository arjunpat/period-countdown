'use strict';

class Elements {
	constructor() {
		this.currentValues = {};
		this.mainCanvas = document.getElementById('main-canvas');
		this.mainCanvasOverlay = document.getElementById('main-canvas-overlay');
		this.dayType = document.getElementById('day-type');
		this.currentPeriodText = document.getElementById('current-period-text');
		this.timeLeft = document.getElementById('time-left');


		this.canvas = new Canvas(this.mainCanvas);

	}

	updateScreen(time) {

		let {percent_completed, days, hours, minutes, seconds, period_name, day_type} = time;

		// make time human readable
		if (seconds < 10) seconds = '0' + seconds;
		if (minutes < 10 && hours !== 0) minutes = '0' + minutes;

		let timeString = '';
		if (hours !== 0) timeString = `${hours}:`;
		timeString += `${minutes}:${seconds}`;

		if (typeof period_name === 'number') period_name = this.getOrdinalNum(period_name) + ' Period';

		let documentTitle = `${timeString} — ${period_name}`;
		if (this.currentValues.documentTitle !== documentTitle) {
			document.title = documentTitle;
			this.currentValues.documentTitle = documentTitle;
		}

		if (document.hasFocus() || true) {
			if ((percent_completed < 1 && this.canvas.props.decimalCompleted <= .1 && !this.canvas.animationInterval) || (percent_completed > 99 && this.canvas.props.decimalCompleted >= .99))
				this.canvas.draw(percent_completed / 100); // more specific at the beginning or end
			else
				this.canvas.animate(Math.floor(percent_completed) / 100);


			if (this.currentValues.dayTypeText !== day_type) {
				this.dayType.innerText = day_type;
				this.currentValues.dayTypeText = day_type;
			}


			if (this.currentValues.currentPeriodText !== period_name) {
				this.currentPeriodText.innerText = period_name;
				// animation
				
				this.currentPeriodText.style.animation = '.6s updatePeriod'
				setTimeout(() => this.currentPeriodText.style.animation = 'none', 1e3);
				this.currentValues.currentPeriodText = period_name;
			}

			if (this.currentValues.timeLeftText !== timeString) {
				this.timeLeft.innerText = timeString;
				this.currentValues.timeLeftText = timeString;
			}

		}
	}

	updateElementsWithPreferences(values) {
		// theme stuff
		this.canvas.updateColors(values.theme.color.background, values.theme.color.completed);
		this.mainCanvasOverlay.style.color = values.theme.color.text;

	}

	updateTextOfElementsArray(elements, text) {
		for (let i = 0; i < elements.length; i++) elements[i].innerText = text;
	}

	updateScreenFontSize() {
		let dimension = window.innerWidth;
		this.dayType.parentElement.style.fontSize = Math.min(55, dimension / 16) + 'px';
		this.dayType.parentElement.parentElement.style.padding = Math.min(50, dimension / 22) + 'px';
		this.timeLeft.style.fontSize = Math.min(170, dimension / (this.timeLeft.innerText.length - 3)) + 'px';
	}

	dimensionCanvas() { this.canvas.dimension() }

	getOrdinalNum(e) { return e + (e > 0 ? ["th", "st", "nd", "rd"][e > 3 && 21 > e || e % 10 > 3 ? 0 : e % 10] : "") }
}
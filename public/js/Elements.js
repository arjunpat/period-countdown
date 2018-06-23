'use strict';

class Elements {
	constructor() {
		this.currentValues = {};
		this.mainCanvas = document.getElementById('main-canvas');
		this.dayType = document.getElementById('day-type');
		this.currentPeriodText = document.getElementById('current-period-text');
		this.timeLeft = document.getElementById('time-left');

	}

	updateTextOfElementsArray(elements, text) {
		for (let i = 0; i < elements.length; i++) elements[i].innerText = text;
	}

	updateDayTypeText(text) {
		if (this.currentValues.dayTypeText !== text) {
			this.dayType.innerText = text;
			this.currentValues.dayTypeText = text;
		}
	}

	updateCurrentPeriodText(text) {
		if (this.currentValues.currentPeriodText !== text) {
			this.currentPeriodText.innerText = text;
			this.currentValues.currentPeriodText = text;
		}
	}

	updateTimeLeft(text) {
		if (this.currentValues.timeLeftText !== text) {
			this.timeLeft.innerText = text;
			this.currentValues.timeLeftText = text;
		}
	}

	updateDocumentTitle(text) {
		if (this.currentValues.documentTitle !== text) {
			document.title = text;
			this.currentValues.documentTitle = text;
		}
	}

	updateScreenFontSize() {
		let dimension = window.innerWidth;
		this.dayType.parentElement.style.fontSize = Math.min(70, Math.floor(dimension / 16)) + 'px';
		this.dayType.parentElement.parentElement.style.padding = Math.min(50, dimension / 22) + 'px';
		this.timeLeft.style.fontSize = Math.min(170, Math.floor(dimension / (this.timeLeft.innerText.length - 3))) + 'px';
	}
}
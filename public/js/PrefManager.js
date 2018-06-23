'use strict';

class PrefManager {
	
	constructor() {
		this.theme = {
			num: 0,
			color: {
				completed: '#fee581',
				background: '#fccb0b',
				text: '#000'
			}
		}
	}

	getAllPreferences() {
		return {
			theme: this.theme
		}
	}

	updateTheme(num) {
		this.theme.num = num;
		this.theme.color.completed = ['#fee581','#1a1a1a','#d9d9d9','#1a1a1a','#1a1a1a'][num];
		this.theme.color.background = ['#fccb0b','#000000','#fff','#000','#000'][num];
		this.theme.color.text = ['#000','#fccb0b','#000','#7cfc00','#c23d80'][num];
		this.theme.name = ['MVHS Light', 'MVHS Dark', 'White', 'Alien Green', 'Purple'][num];
	}


}
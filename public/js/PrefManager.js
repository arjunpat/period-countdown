'use strict';

class PrefManager {
	
	constructor() {
		this.theme = {
			color: {}
		}
		this.updateTheme(0);
	}

	getAllPreferences() {
		return {
			theme: this.theme
		}
	}

	updateTheme(num) {
		this.theme.num = num;
		this.theme.color.completed = ['#262626','#fee581','#d9d9d9','#1a1a1a','#1a1a1a'][num];
		this.theme.color.background = ['#000000', '#fccb0b','#fff','#000','#000'][num];
		this.theme.color.text = ['#fccb0b','#000','#000','#7cfc00','#c23d80'][num];
		this.theme.name = ['MVHS Dark','MVHS Light','White','Alien Green','Purple'][num];
	}


}
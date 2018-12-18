// http://mvla.net/files/user/91/file/Los_Altos_High_School_Bell_Schedule1.pdf
const schedule = {
	offset: 0,
	weekly_presets: ['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'],
	calendar: [
		
	]
}

const school = require('./mvhs.js').school;

module.exports = { schedule, school };

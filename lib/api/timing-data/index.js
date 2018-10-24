const mvhs = require('./mvhs.js');

const paly = require('./paly.js');


module.exports = {
	mvhs: {
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school)
	},
	paly: {
		schedule: JSON.stringify(paly.schedule),
		school: JSON.stringify(paly.school)
	}
}

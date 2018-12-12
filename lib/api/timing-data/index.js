const mvhs = require('./mvhs.js');
const lahs = require('./lahs.js');
const paly = require('./paly.js');


module.exports = {
	mvhs: {
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school)
	},
	lahs: {
		schedule: JSON.stringify(lahs.schedule),
		school: JSON.stringify(lahs.school)
	},
	paly: {
		schedule: JSON.stringify(paly.schedule),
		school: JSON.stringify(paly.school)
	}
}

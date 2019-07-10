const mvhs = require('./mvhs.js');
const lahs = require('./lahs.js');
const paly = require('./paly.js');


module.exports = {
	mvhs: {
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school),
		periods: JSON.stringify(mvhs.school.periods)
	},
	lahs: {
		schedule: JSON.stringify(lahs.schedule),
		school: JSON.stringify(lahs.school),
		periods: JSON.stringify(lahs.school.periods)
	},
	paly: {
		schedule: JSON.stringify(paly.schedule),
		school: JSON.stringify(paly.school),
		periods: JSON.stringify(paly.school.periods)
	}
}

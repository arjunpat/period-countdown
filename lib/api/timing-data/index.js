const mvhs = require('./mvhs.js');


module.exports = {
	mvhs: {
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school)
	}
}

module.exports.schools = JSON.stringify(Object.keys(module.exports));

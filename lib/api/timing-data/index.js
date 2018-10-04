const mvhs = require('./mvhs.js');


module.exports = {
	mvhs: {
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school)
	},
	schools: JSON.stringify([
		{
			name: 'Mountain View High School',
			id: 'mvhs'
		}
	])
}

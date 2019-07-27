const mvhs = require('./mvhs.js');
const paly = require('./paly.js');

const obj = {
	mvhs: {
		name: 'Mountain View High School',
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school),
		periods: JSON.stringify(mvhs.school.periods)
	},
	lahs: {
		name: 'Los Altos High School',
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school),
		periods: JSON.stringify(mvhs.school.periods)
		/*schedule: JSON.stringify(lahs.schedule),
		school: JSON.stringify(lahs.school),
		periods: JSON.stringify(lahs.school.periods)*/
	},
	paly: {
		name: 'Palo Alto High School',
		schedule: JSON.stringify(paly.schedule),
		school: JSON.stringify(paly.school),
		periods: JSON.stringify(paly.school.periods)
	}
}

const schools = [];
for (let key in obj) {
  if (!obj.hasOwnProperty(key))
    continue;

  schools.push({
    n: obj[key].name,
    id: key
  });
}

obj.schools = schools;

module.exports = obj;
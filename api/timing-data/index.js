const Parser = require('./Parser');
const Validator = require('./Validator');
const fs = require('fs');

function loadSchool(id) {
	let school = fs.readFileSync(`./timing-data/${id}/school.txt`).toString();
	let schedule = fs.readFileSync(`./timing-data/${id}/schedule.txt`).toString();

	school = Parser.school(school);
	schedule = Parser.schedule(schedule);

	let validator = new Validator(school, schedule);
	if (validator.areErrors()) {
		throw JSON.stringify(validator.getErrors());
	}

	return {
		school: JSON.stringify(validator.getCleaned().school),
		schedule: JSON.stringify(validator.getCleaned().schedule),
		periods: JSON.stringify(validator.getCleaned().school.periods)
	}
}

const obj = {
	mvhs: {
		name: 'Mountain View High School',
		...loadSchool('mvhs')
		/*schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school),
		periods: JSON.stringify(mvhs.school.periods)*/
	},
	/*lahs: {
		name: 'Los Altos High School',
		schedule: JSON.stringify(mvhs.schedule),
		school: JSON.stringify(mvhs.school),
		periods: JSON.stringify(mvhs.school.periods)
	},
	paly: {
		name: 'Palo Alto High School',
		schedule: JSON.stringify(paly.schedule),
		school: JSON.stringify(paly.school),
		periods: JSON.stringify(paly.school.periods)
	}*/
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
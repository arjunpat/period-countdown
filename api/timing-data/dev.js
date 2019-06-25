// http://mvla.net/files/user/140/file/MVHS%20Bell%20Schedule(1).pdf
const schedule = {
	offset: 0,
	weekly_presets: ['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'],
	calendar: [
		/*{
			date: '6/23/2018',
			content: {
				type: 'A',
				name: 'Custom Name Support'
			}
		},*/
		/*{
			from: '6/1/2018',
			to: '8/20/2018',
			content: {
				schedule: [],
				name: 'Summer Break'
			}
		}*/
		{
			from: '7/21/2018',
			to: '8/25/2018',
			content: {
				type: 'A',
			}
		},
		/*{
			from: '6/21/2018',
			to: '6/25/2018',
			content: {
				name: 'Summer Break'
			}
		}*/
		/*{
			from: '6/21/2018',
			to: '8/25/2018',
			content: {
				name: 'BREAK!',
				schedule: [
					{
						n: 1,
						f: '0:30'
					},
					{
						n: 4,
						f: '13:01'
					},
					{
						n: 7,
						f: '13:20'
					}
				]
			}
		}*/
	]
}

const school = require('./mvhs.js').school;

module.exports = { schedule, school };

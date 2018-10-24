// http://mvla.net/files/user/140/file/MVHS%20Bell%20Schedule(1).pdf
const schedule = {
	offset: 0,
	weekly_presets: ['weekend', 'even', 'odd', 'even', 'odd', 'even', 'weekend'],
	calendar: [
		{
			from: '7/21/2018',
			to: '8/25/2018',
			content: {
				type: 'even'
			}
		}
	]
}

const school = {
	periods: ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7'],
	presets: {
		'even': {
			n: 'Even Block',
			s: [
				{
					n: 'Passing',
					f: '8:15'
				},
				{
					n: 'Period 2',
					f: '8:20'
				},
				{
					n: 'Brunch',
					f: '9:50'
				},
				{
					n: 'Passing',
					f: '10:00'
				},
				{
					n: 'Period 4',
					f: '10:05'
				},
				{
					n: 'Lunch',
					f: '11:35'
				},
				{
					n: 'Passing',
					f: '12:05'
				},
				{
					n: 'Period 6',
					f: '12:15'
				},
				{
					n: 'InFocus',
					f: '13:45'
				},
				{
					n: 'Passing',
					f: '13:55'
				},
				{
					n: 'Advisory',
					f: '14:05'
				},
				{
					n: 'Free',
					f: '14:50'
				}
			]
		},
		'odd': {
			n: 'Odd Block',
			s: [
				{
					n: 'Passing',
					f: '8:15'
				},
				{
					n: 'Period 1',
					f: '8:20'
				},
				{
					n: 'Brunch',
					f: '9:50'
				},
				{
					n: 'Passing',
					f: '10:00'
				},
				{
					n: 'Period 3',
					f: '10:05'
				},
				{
					n: 'Lunch',
					f: '11:35'
				},
				{
					n: 'Passing',
					f: '12:05'
				},
				{
					n: 'Period 5',
					f: '12:15'
				},
				{
					n: 'InFocus',
					f: '13:45'
				},
				{
					n: 'Passing',
					f: '13:55'
				},
				{
					n: 'Period 7',
					f: '14:05'
				},
				{
					n: 'Free',
					f: '15:35'
				}
			]
		}
	}
}

module.exports = { schedule, school };

// http://mvla.net/files/user/140/file/MVHS%20Bell%20Schedule(1).pdf
const schedule = {
	offset: 0,
	weekly_presets: {
		pattern: [
			'weekend', 'odd', 'even', 'odd', 'even', 'odd', 'weekend',
			'weekend', 'even', 'even', 'odd', 'even', 'odd', 'weekend'
		],
		start: '5/19/2019'
	},
	calendar: [
		{
			from: '6/1/2019',
			to: '8/11/2019',
			content: {
				n: 'Summer Break',
				s: []
			}
		}
	]
}

const school = {
	periods: ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7'],
	presets: {
		even: {
			n: 'Even Block',
			s: [
				'8:15 Passing',
				'8:20 Period 2',
				'9:50 Brunch',
				'10:00 Passing',
				'10:05 Period 4',
				'11:35 Lunch',
				'12:05 Passing',
				'12:15 Period 6',
				'13:45 InFocus',
				'13:55 Passing',
				'14:05 Advisory',
				'14:50 Free'
			]
		},
		odd: {
			n: 'Odd Block',
			s: [
				'8:15 Passing',
				'8:20 Period 1',
				'9:50 Brunch',
				'10:00 Passing',
				'10:05 Period 3',
				'11:35 Lunch',
				'12:05 Passing',
				'12:15 Period 5',
				'13:45 InFocus',
				'13:55 Passing',
				'14:05 Period 7',
				'15:35 Free'
			]
		},
		weekend: {
			s: [],
			n: 'Weekend'
		}
	}
}

module.exports = { schedule, school }

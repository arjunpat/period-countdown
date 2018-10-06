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

const school = {
	periods: ['Period 0', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7'],
	presets: {
		A: {
			n: 'Normal Schedule',
			s: [
				{
					n: 'Passing',
					f: '7:10'
				},
				{
					n: 'Period 0',
					f: '7:15'
				},
				{
					n: 'Passing',
					f: '7:05'
				},
				{
					n: 'Period 1',
					f: '8:10'
				},
				{
					n: 'Passing',
					f: '9:00'
				},
				{
					n: 'Period 2',
					f: '9:05'
				},
				{
					n: 'Brunch',
					f: '10:00'
				},
				{
					n: 'Passing',
					f: '10:10'
				},
				{
					n: 'Period 3',
					f: '10:15'
				},
				{
					n: 'Passing',
					f: '11:05'
				},
				{
					n: 'Period 4',
					f: '11:10'
				},
				{
					n: 'Lunch',
					f: '12:00'
				},
				{
					n: 'Passing',
					f: '12:45'
				},
				{
					n: 'Period 5',
					f: '12:50'
				},
				{
					n: 'Passing',
					f: '13:40'
				},
				{
					n: 'Period 6',
					f: '13:45'
				},
				{
					n: 'Passing',
					f: '14:35'
				},
				{
					n: 'Period 7',
					f: '14:40'
				},
				{
					n: 'Free',
					f: '15:30'
				}
			]
		},
		B: {
			n: 'Block Wednesday',
			s: [
				{
					n: 'Passing',
					f: '7:10'
				},
				{
					n: 'Period 0',
					f: '7:15'
				},
				{
					n: 'Passing',
					f: '8:45'
				},
				{
					n: 'Period 2',
					f: '8:50'

				},
				{
					n: 'Brunch',
					f: '10:25'

				},
				{
					n: 'Passing',
					f: '10:40'
				},
				{
					n: 'Period 4',
					f: '10:45'

				},
				{
					n: 'Lunch',
					f: '12:15'

				},
				{
					n: 'Passing',
					f: '13:00'
				},
				{
					n: 'Period 6',
					f: '13:05'

				},
				{
					n: 'Free',
					f: '14:35'
				}
			]
		},
		C: {
			n: 'Block Thursday',
			s: [
				{
					n: 'Passing',
					f: '8:05'
				},
				{
					n: 'Period 1',
					f: '8:10'
				},
				{
					n: 'Brunch',
					f: '9:45'
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
					f: '12:20'
				},
				{
					n: 'Period 5',
					f: '12:25'
				},
				{
					n: 'Passing',
					f: '13:55'
				},
				{
					n: 'Period 7',
					f: '14:00'
				},
				{
					n: 'Free',
					f: '15:30'
				}
			]
		},
		D: {
			n: 'Modified Block Wednesday',
			s: [
				{
					n: 'Passing',
					f: '7:10'
				},
				{
					n: 'Period 0',
					f: '7:15'
				},
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
					f: '9:20'
				},
				{
					n: 'Passing',
					f: '9:30'
				},
				{
					n: 'Period 4',
					f: '9:35'
				},
				{
					n: 'Passing',
					f: '10:35'
				},
				{
					n: 'Period 6',
					f: '10:40'
				},
				{
					n: 'Lunch',
					f: '11:40'
				},
				{
					n: 'Free',
					f: '12:25'
				}
			]
		},
		E: {
			n: 'Modified Block Thursday',
			s: [
				{
					n: 'Passing',
					f: '8:05'
				},
				{
					n: 'Period 1',
					f: '8:10'
				},
				{
					n: 'Passing',
					f: '9:10'
				},
				{
					n: 'Period 3',
					f: '9:15'
				},
				{
					n: 'Brunch',
					f: '10:15'
				},
				{
					n: 'Passing',
					f: '10:25'
				},
				{
					n: 'Period 5',
					f: '10:30'
				},
				{
					n: 'Passing',
					f: '11:30'
				},
				{
					n: 'Period 7',
					f: '11:35'
				},
				{
					n: 'Lunch',
					f: '12:35'
				},
				{
					n: 'Free',
					f: '13:20'
				}
			]
		},
		F: {
			n: 'Minimum Day',
			s: [
				{
					n: 'Passing',
					f: '7:25'
				},
				{
					n: 'Period 0',
					f: '7:30'
				},
				{
					n: 'Passing',
					f: '8:00'
				},
				{
					n: 'Period 1',
					f: '8:05'
				},
				{
					n: 'Passing',
					f: '8:35'
				},
				{
					n: 'Period 2',
					f: '8:40'
				},
				{
					n: 'Passing',
					f: '9:10'
				},
				{
					n: 'Period 3',
					f: '9:15'
				},
				{
					n: 'Passing',
					f: '9:45'
				},
				{
					n: 'Period 4',
					f: '9:50'
				},
				{
					n: 'Brunch',
					f: '10:20'
				},
				{
					n: 'Passing',
					f: '10:30'
				},
				{
					n: 'Period 5',
					f: '10:35'
				},
				{
					n: 'Passing',
					f: '11:05'
				},
				{
					n: 'Period 6',
					f: '11:10'
				},
				{
					n: 'Passing',
					f: '11:40'
				},
				{
					n: 'Period 7',
					f: '11:45'
				},
				{
					n: 'Free',
					f: '12:15'
				}
			]
		},
		G: {
			n: 'Assembly Schedule',
			s: [
				{
					n: 'Passing',
					f: '7:15'
				},
				{
					n: 'Period 0',
					f: '7:20'
				},
				{
					n: 'Passing',
					f: '8:05'
				},
				{
					n: 'Period 1',
					f: '8:10'
				},
				{
					n: 'Passing',
					f: '8:55'
				},
				{
					n: '2A',
					f: '9:00'
				},
				{
					n: 'Passing',
					f: '9:45'
				},
				{
					n: '2B',
					f: '9:50'
				},
				{
					n: 'Brunch',
					f: '10:35'
				},
				{
					n: 'Passing',
					f: '10:45'
				},
				{
					n: 'Period 3',
					f: '10:50'
				},
				{
					n: 'Passing',
					f: '11:35'
				},
				{
					n: 'Period 4',
					f: '11:40'
				},
				{
					n: 'Lunch',
					f: '12:25'
				},
				{
					n: 'Passing',
					f: '13:00'
				},
				{
					n: 'Period 5',
					f: '13:05'
				},
				{
					n: 'Passing',
					f: '13:50'
				},
				{
					n: 'Period 6',
					f: '13:55'
				},
				{
					n: 'Passing',
					f: '14:40'
				},
				{
					n: 'Period 7',
					f: '14:45'
				},
				{
					n: 'Free',
					f: '15:30'
				}
			]
		},
		tutorial: {
			n: 'Tutorial Schedule',
			s: [
				{
					n: 'Passing',
					f: '7:15'
				},
				{
					n: 'Period 0',
					f: '7:20'
				},
				{
					n: 'Passing',
					f: '8:05'
				},
				{
					n: 'Period 1',
					f: '8:10'
				},
				{
					n: 'Passing',
					f: '8:55'
				},
				{
					n: 'Period 2',
					f: '9:00'
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
					n: 'Tutorial',
					f: '10:50'
				},
				{
					n: 'Passing',
					f: '11:25'
				},
				{
					n: 'Period 4',
					f: '11:30'
				},
				{
					n: 'Lunch',
					f: '12:15'
				},
				{
					n: 'Passing',
					f: '13:00'
				},
				{
					n: 'Period 5',
					f: '13:05'
				},
				{
					n: 'Passing',
					f: '13:50'
				},
				{
					n: 'Period 6',
					f: '13:55'
				},
				{
					n: 'Passing',
					f: '14:40'
				},
				{
					n: 'Period 7',
					f: '14:45'
				},
				{
					n: 'Free',
					f: '15:30'
				}
			]
		},
		weekend: {
			n: 'Weekend',
			s: []
		}
	}
}

module.exports = { schedule, school };

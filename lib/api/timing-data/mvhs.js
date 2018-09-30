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
	periods: [0, 1, 2, 3, 4, 5, 6, 7],
	presets: {
		A: {
			n: 'Normal Schedule',
			s: [
				{
					n: 0,
					f: '7:15'
				},
				{
					n: 1,
					f: '8:10'
				},
				{
					n: 2,
					f: '9:05'
				},
				{
					n: 'Brunch',
					f: '10:00'
				},
				{
					n: 3,
					f: '10:15'
				},
				{
					n: 4,
					f: '11:10'
				},
				{
					n: 'Lunch',
					f: '12:00'
				},
				{
					n: 5,
					f: '12:50'
				},
				{
					n: 6,
					f: '13:45'
				},
				{
					n: 7,
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
					n: 0,
					f: '7:15'
				},
				{
					n: 2,
					f: '8:50'

				},
				{
					n: 'Brunch',
					f: '10:25'

				},
				{
					n: 4,
					f: '10:45'

				},
				{
					n: 'Lunch',
					f: '12:15'

				},
				{
					n: 6,
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
					n: 1,
					f: '8:10'
				},
				{
					n: 'Brunch',
					f: '9:45'
				},
				{
					n: 3,
					f: '10:05'
				},
				{
					n: 'Lunch',
					f: '11:35'
				},
				{
					n: 5,
					f: '12:25'
				},
				{
					n: 7,
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
					n: 0,
					f: '7:15'
				},
				{
					n: 2,
					f: '8:20'
				},
				{
					n: 'Brunch',
					f: '9:20'
				},
				{
					n: 4,
					f: '9:35'
				},
				{
					n: 6,
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
					n: 1,
					f: '8:10'
				},
				{
					n: 3,
					f: '9:15'
				},
				{
					n: 'Brunch',
					f: '10:15'
				},
				{
					n: 5,
					f: '10:30'
				},
				{
					n: 7,
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
					n: 0,
					f: '7:30'
				},
				{
					n: 1,
					f: '8:05'
				},
				{
					n: 2,
					f: '8:40'
				},
				{
					n: 3,
					f: '9:15'
				},
				{
					n: 4,
					f: '9:50'
				},
				{
					n: 'Brunch',
					f: '10:20'
				},
				{
					n: 5,
					f: '10:35'
				},
				{
					n: 6,
					f: '11:10'
				},
				{
					n: 7,
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
					n: 0,
					f: '7:20'
				},
				{
					n: 1,
					f: '8:10'
				},
				{
					n: '2A',
					f: '9:00'
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
					n: 3,
					f: '10:50'
				},
				{
					n: 4,
					f: '11:40'
				},
				{
					n: 'Lunch',
					f: '12:25'
				},
				{
					n: 5,
					f: '13:05'
				},
				{
					n: 6,
					f: '13:55'
				},
				{
					n: 7,
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
					n: 0,
					f: '7:20'
				},
				{
					n: 1,
					f: '8:10'
				},
				{
					n: 2,
					f: '9:00'
				},
				{
					n: 'Brunch',
					f: '9:50'
				},
				{
					n: 3,
					f: '10:05'
				},
				{
					n: 'Tutorial',
					f: '10:50'
				},
				{
					n: 4,
					f: '11:30'
				},
				{
					n: 'Lunch',
					f: '12:15'
				},
				{
					n: 5,
					f: '13:05'
				},
				{
					n: 6,
					f: '13:55'
				},
				{
					n: 7,
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

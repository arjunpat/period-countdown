let calendar = [
	/*{
		date: '6/21/2018',
		content: {
			type: 'A',
			name: 'Custom Name Support'
		}
	},*/
	{
		from: '6/1/2018',
		to: '8/20/2018',
		content: {
			schedule: [],
			name: 'BREAK!'
		}
	}
	/*{
		from: '6/21/2018',
		to: '6/25/2018',
		content: {
			type: 'A',
			name: 'BREAK!'
		}
	}*/
]

let presets = {
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


/*let presets = {
	A: {
		name: 'Normal Schedule',
		schedule: [
			{
				name: 0,
				from: '7:15',
				to: '8:05'
			},
			{
				name: 1,
				from: '8:10',
				to: '9:00'
			},
			{
				name: 2,
				from: '9:05',
				to: '10:00'
			},
			{
				name: 'Brunch',
				from: '10:00',
				to: '10:10'
			},
			{
				name: 3,
				from: '10:15',
				to: '11:05'
			},
			{
				name: 4,
				from: '11:10',
				to: '12:00'
			},
			{
				name: 'Lunch',
				from: '12:00',
				to: '12:45'
			},
			{
				name: 5,
				from: '12:50',
				to: '13:40'
			},
			{
				name: 6,
				from: '13:45',
				to: '14:35'
			},
			{
				name: 7,
				from: '14:40',
				to: '15:30'
			}
		]
	},
	B: {
		name: 'Block Wednesday',
		schedule: [
			{
				name: 0,
				from: '7:15',
				to: '8:45'
			},
			{
				name: 2,
				from: '8:50',
				to: '10:25'
			},
			{
				name: 'Brunch',
				from: '10:25',
				to: '10:40'
			},
			{
				name: 4,
				from: '10:45',
				to: '12:15'
			},
			{
				name: 'Lunch',
				from: '12:15',
				to: '13:00'
			},
			{
				name: 6,
				from: '13:05',
				to: '14:35'
			}
		]
	},
	C: {
		name: 'Block Thursday',
		schedule: [
			{
				name: 1,
				from: '8:10',
				to: '9:45'
			},
			{
				name: 'Brunch',
				from: '9:45',
				to: '10:00'
			},
			{
				name: 3,
				from: '10:05',
				to: '11:35'
			},
			{
				name: 'Lunch',
				from: '11:35',
				to: '12:20'
			},
			{
				name: 5,
				from: '12:25',
				to: '13:55'
			},
			{
				name: 7,
				from: '14:00',
				to: '15:30'
			}
		]
	},
	D: {
		name: 'Modified Block Wednesday',
		schedule: [
			{
				name: 0,
				from: '7:15',
				to: '8:15'
			},
			{
				name: 2,
				from: '8:20',
				to: '9:20'
			},
			{
				name: 'Brunch',
				from: '9:20',
				to: '9:30'
			},
			{
				name: 4,
				from: '9:35',
				to: '10:35'
			},
			{
				name: 6,
				from: '10:40',
				to: '11:40'
			},
			{
				name: 'Lunch',
				from: '11:40',
				to: '12:25'
			}
		]
	},
	E: {
		name: 'Modified Block Thursday',
		schedule: [
			{
				name: 1,
				from: '8:10',
				to: '9:10'
			},
			{
				name: 3,
				from: '9:15',
				to: '10:15'
			},
			{
				name: 'Brunch',
				from: '10:15',
				to: '10:25'
			},
			{
				name: 5,
				from: '10:30',
				to: '11:30'
			},
			{
				name: 7,
				from: '11:35',
				to: '12:35'
			},
			{
				name: 'Lunch',
				from: '12:35',
				to: '13:20'
			}
		]
	},
	F: {
		name: 'Minimum Day',
		schedule: [
			{
				name: 0,
				from: '7:30',
				to: '8:00'
			},
			{
				name: 1,
				from: '8:05',
				to: '8:35'
			},
			{
				name: 2,
				from: '8:40',
				to: '9:10'
			},
			{
				name: 3,
				from: '9:15',
				to: '9:45'
			},
			{
				name: 4,
				from: '9:50',
				to: '10:20'
			},
			{
				name: 'Brunch',
				from: '10:20',
				to: '10:30'
			},
			{
				name: 5,
				from: '10:35',
				to: '11:05'
			},
			{
				name: 6,
				from: '11:10',
				to: '11:40'
			},
			{
				name: 7,
				from: '11:45',
				to: '12:15'
			}
		]
	},
	G: {
		name: 'Assembly Schedule',
		schedule: [
			{
				name: 0,
				from: '7:20',
				to: '8:05'
			},
			{
				name: 1,
				from: '8:10',
				to: '8:55'
			},
			{
				name: '2A',
				from: '9:00',
				to: '9:45'
			},
			{
				name: '2B',
				from: '9:50',
				to: '10:35'
			},
			{
				name: 'Brunch',
				from: '10:35',
				to: '10:45'
			},
			{
				name: 3,
				from: '10:50',
				to: '11:35'
			},
			{
				name: 4,
				from: '11:40',
				to: '12:25'
			},
			{
				name: 'Lunch',
				from: '12:25',
				to: '13:00'
			},
			{
				name: 5,
				from: '13:05',
				to: '13:50'
			},
			{
				name: 6,
				from: '13:55',
				to: '14:40'
			},
			{
				name: 7,
				from: '14:45',
				to: '15:30'
			}
		]
	},
	tutorial: {
		name: 'Tutorial Schedule',
		schedule: [
			{
				name: 0,
				from: '7:20',
				to: '8:05'
			},
			{
				name: 1,
				from: '8:10',
				to: '8:55'
			},
			{
				name: 2,
				from: '9:00',
				to: '9:50'
			},
			{
				name: 'Brunch',
				from: '9:50',
				to: '10:00'
			},
			{
				name: 3,
				from: '10:05',
				to: '10:50'
			},
			{
				name: 'Tutorial',
				from: '10:50',
				to: '11:25'
			},
			{
				name: 4,
				from: '11:30',
				to: '12:15'
			},
			{
				name: 'Lunch',
				from: '12:15',
				to: '13:00'
			},
			{
				name: 5,
				from: '13:05',
				to: '13:50'
			},
			{
				name: 6,
				from: '13:55',
				to: '14:40'
			},
			{
				name: 7,
				from: '14:45',
				to: '15:30'
			}
		]
	},
	weekend: {
		name: 'Weekend',
		schedule: []
	}
}*/

module.exports = {
	calendar: {
		data: JSON.stringify(calendar),
		headers: {
			'Cache-control': 'max-age=600',
			'Content-type': 'application/json; charset=UTF-8'
		}
	},
	presets: {
		data: JSON.stringify(presets),
		headers: {
			'Cache-control': 'max-age=43200',
			'Content-type': 'application/json; charset=UTF-8'
		}
	}
}
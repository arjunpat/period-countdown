// http://mvla.net/files/user/140/file/MVHS%20Bell%20Schedule(1).pdf
const schedule = {
	offset: 0,
	weekly_presets: {
		pattern: ['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'],
		start: '1/6/2019'
	},
	calendar: [
		/*{
			date: '9/19/2018',
			content: {
				type: 'D'
			}
		},
		{
			date: '9/20/2018',
			content: {
				type: 'E'
			}
		},
		{
			date: '9/24/2018',
			content: {
				type: 'G'
			}
		},
		{
			date: '9/28/2018',
			content: {
				type: 'F'
			}
		},
		{
			date: '10/9/2018',
			content: {
				type: 'B'
			}
		},
		{
			date: '10/10/2018',
			content: {
				n: 'PSAT Testing',
				s: [
					'8:00 Passing',
					'8:05 Testing',
					'12:15 Free'
				]
			}
		},
		{
			date: '10/15/2018',
			content: {
				type: 'tutorial'
			}
		},
		{
			date: '10/29/2018',
			content: {
				type: 'tutorial'
			}
		},
		{
			date: '11/12/2018',
			content: {
				s: [],
				n: 'Veteran\'s Day'
			}
		},
		{
			from: '11/21/2018',
			to: '11/23/2018',
			content: {
				s: [],
				n: 'Holiday'
			}
		},
		{
			date: '12/19/2018',
			content: {
				n: 'Finals',
				s: [
					'8:05 Passing',
					'8:10 Period 2',
					'9:45 Brunch',
					'10:05 Passing',
					'10:10 Period 6',
					'11:45 Lunch',
					'12:30 Passing',
					'12:35 Period 7',
					'14:10 Free'
				]
			}
		},
		{
			date: '12/20/2018',
			content: {
				n: 'Finals',
				s: [
					'8:05 Passing',
					'8:10 Period 0',
					'9:45 Brunch',
					'10:05 Passing',
					'10:10 Period 1',
					'11:45 Lunch',
					'12:30 Passing',
					'12:35 Period 5',
					'14:10 Free'
				]
			}
		},
		{
			date: '12/21/2018',
			content: {
				n: 'Finals',
				s: [
					'8:05 Passing',
					'8:10 Period 3',
					'9:45 Brunch',
					'10:10 Period 4',
					'11:45 Free'
				]
			}
		},
		{
			from: '12/22/2018',
			to: '1/7/2019',
			content: {
				n: 'Holiday Break',
				s: []
			}
		},
		{
			date: '1/21/2019',
			content: {
				type: 'weekend',
				n: 'MLK Day'
			}
		},
		{
			date: '1/23/2019',
			content: {
				n: 'Advisory Block',
				s: [
					'7:10 Passing',
					'7:15 Period 0',
					'8:40 Passing',
					'8:45 Period 2',
					'10:10 Brunch',
					'10:25 Passing',
					'10:30 Period 4',
					'11:55 Advisory',
					'12:20 Lunch',
					'13:05 Passing',
					'13:10 Period 6',
					'14:35 Free'
				]
			}
		},
		{
			date: '1/24/2019',
			content: {
				n: 'Advisory Block',
				s: [
					'8:05 Passing',
					'8:10 Period 1',
					'9:35 Brunch',
					'9:50 Passing',
					'9:55 Period 3',
					'11:20 Advisory',
					'11:45 Lunch',
					'12:30 Passing',
					'12:35 Period 5',
					'14:00 Passing',
					'14:05 Period 7',
					'15:30 Free'
				]
			}
		},
		{
			date: '1/25/2019',
			content: {
				type: 'tutorial'
			}
		},
		{
			date: '2/6/2019',
			content: {
				type: 'D'
			}
		},
		{
			date: '2/7/2019',
			content: {
				type: 'E'
			}
		},
		{
			date: '2/8/2019',
			content: {
				type: 'G'
			}
		},
		{
			from: '2/18/2019',
			to: '2/22/2019',
			content: {
				n: 'Winter Break',
				s: []
			}
		},
		{
			from: '3/16/2019',
			to: '3/19/2019',
			content: {
				n: 'Long Weekend',
				s: []
			}
		},
		{
			date: '3/25/2019',
			content: {
				type: 'G'
			}
		},
		{
			from: '4/13/2019',
			to: '4/21/2019',
			content: {
				n: 'Break',
				s: []
			}
		},
		{
			date: '4/23/2019',
			content: {
				n: 'SBAC Testing',
				s: [
					'8:05 Passing',
					'8:10 Junior SBAC Testing',
					'10:45 Passing',
					'10:50 Period 2',
					'11:45 Lunch',
					'12:30 Passing',
					'12:35 Period 4',
					'13:30 Passing',
					'13:35 Period 6',
					'14:30 Passing',
					'14:35 Period 0',
					'15:30 Free'
				]
			}
		},
		{
			date: '4/24/2019',
			content: {
				n: 'SBAC Testing',
				s: [
					'8:05 Passing',
					'8:10 Junior SBAC Testing',
					'10:20 Break',
					'10:25 Passing',
					'10:30 Period 1',
					'11:30 Lunch',
					'12:15 Passing',
					'12:20 Period 3',
					'13:20 Passing',
					'13:25 Period 5',
					'14:25 Passing',
					'14:30 Period 7',
					'15:30 Free'
				]
			}
		},
		{
			date: '4/25/2019',
			content: {
				n: 'SBAC & CAST Testing',
				s: [
					'8:05 Passing',
					'8:10 SBAC & CSAT Testing',
					'10:20 Break',
					'10:25 Passing',
					'10:30 Period 2',
					'11:30 Lunch',
					'12:15 Passing',
					'12:20 Period 4',
					'13:20 Passing',
					'13:25 Period 6',
					'14:25 Passing',
					'14:30 Period 0',
					'15:30 Free'
				]
			}
		},
		{
			date: '4/26/2019',
			content: {
				n: 'SBAC Testing',
				s: [
					'8:05 Passing',
					'8:10 SBAC Testing',
					'10:20 Break',
					'10:25 Passing',
					'10:30 Period 1',
					'11:30 Lunch',
					'12:15 Passing',
					'12:20 Period 3',
					'13:20 Passing',
					'13:25 Period 5',
					'14:25 Passing',
					'14:30 Period 7',
					'15:30 Free'
				]
			}
		},
		{
			date: '5/20/2019',
			content: {
				type: 'G'
			}
		},
		{
			date: '6/4/2019',
			content: {
				type: 'A'
			}
		},
		{
			date: '6/5/2019',
			content: {
				n: 'Finals',
				s: [
					'8:05 Passing',
					'8:10 Period 2',
					'9:45 Brunch',
					'10:05 Passing',
					'10:10 Period 6',
					'11:45 Lunch',
					'12:30 Passing',
					'12:35 Period 7',
					'14:10 Free'
				]
			}
		},
		{
			date: '6/6/2019',
			content: {
				n: 'Finals',
				s: [
					'8:05 Passing',
					'8:10 Period 0',
					'9:45 Brunch',
					'10:05 Passing',
					'10:10 Period 1',
					'11:45 Lunch',
					'12:30 Passing',
					'12:35 Period 5',
					'14:10 Free'
				]
			}
		},
		{
			date: '6/7/2019',
			content: {
				n: 'Finals',
				s: [
					'8:05 Passing',
					'8:10 Period 3',
					'9:45 Brunch',
					'10:10 Period 4',
					'11:45 Free'
				]
			}
		},*/
		{
			from: '6/8/2019',
			to: '8/18/2019',
			content: {
				n: 'Summer Break',
				s: []
			}
		}
	]
}

const school = {
	periods: ['Period 0', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7'],
	presets: {
		A: {
			n: 'Normal Schedule',
			s: [
				'7:10 Passing',
				'7:15 Period 0',
				'8:05 Passing',
				'8:10 Period 1',
				'9:00 Passing',
				'9:05 Period 2',
				'10:00 Brunch',
				'10:10 Passing',
				'10:15 Period 3',
				'11:05 Passing',
				'11:10 Period 4',
				'12:00 Lunch',
				'12:45 Passing',
				'12:50 Period 5',
				'13:40 Passing',
				'13:45 Period 6',
				'14:35 Passing',
				'14:40 Period 7',
				'15:30 Free'
			]
		},
		B: {
			n: 'Block Wednesday',
			s: [
				'7:10 Passing',
				'7:15 Period 0',
				'8:45 Passing',
				'8:50 Period 2',
				'10:25 Brunch',
				'10:40 Passing',
				'10:45 Period 4',
				'12:15 Lunch',
				'13:00 Passing',
				'13:05 Period 6',
				'14:35 Free'
			]
		},
		C: {
			n: 'Block Thursday',
			s: [
				'8:05 Passing',
				'8:10 Period 1',
				'9:45 Brunch',
				'10:00 Passing',
				'10:05 Period 3',
				'11:35 Lunch',
				'12:20 Passing',
				'12:25 Period 5',
				'13:55 Passing',
				'14:00 Period 7',
				'15:30 Free'
			]
		},
		D: {
			n: 'Modified Block Wednesday',
			s: [
				'7:10 Passing',
				'7:15 Period 0',
				'8:15 Passing',
				'8:20 Period 2',
				'9:20 Brunch',
				'9:30 Passing',
				'9:35 Period 4',
				'10:35 Passing',
				'10:40 Period 6',
				'11:40 Lunch',
				'12:25 Free'
			]
		},
		E: {
			n: 'Modified Block Thursday',
			s: [
				'8:05 Passing',
				'8:10 Period 1',
				'9:10 Passing',
				'9:15 Period 3',
				'10:15 Brunch',
				'10:25 Passing',
				'10:30 Period 5',
				'11:30 Passing',
				'11:35 Period 7',
				'12:35 Lunch',
				'13:20 Free'
			]
		},
		F: {
			n: 'Minimum Day',
			s: [
				'7:25 Passing',
				'7:30 Period 0',
				'8:00 Passing',
				'8:05 Period 1',
				'8:35 Passing',
				'8:40 Period 2',
				'9:10 Passing',
				'9:15 Period 3',
				'9:45 Passing',
				'9:50 Period 4',
				'10:20 Brunch',
				'10:30 Passing',
				'10:35 Period 5',
				'11:05 Passing',
				'11:10 Period 6',
				'11:40 Passing',
				'11:45 Period 7',
				'12:15 Free'
			]
		},
		G: {
			n: 'Assembly Schedule',
			s: [
				'7:15 Passing',
				'7:20 Period 0',
				'8:05 Passing',
				'8:10 Period 1',
				'8:55 Passing',
				'9:00 2A',
				'9:45 Passing',
				'9:50 2B',
				'10:35 Brunch',
				'10:45 Passing',
				'10:50 Period 3',
				'11:35 Passing',
				'11:40 Period 4',
				'12:25 Lunch',
				'13:00 Passing',
				'13:05 Period 5',
				'13:50 Passing',
				'13:55 Period 6',
				'14:40 Passing',
				'14:45 Period 7',
				'15:30 Free'
			]
		},
		tutorial: {
			n: 'Tutorial Schedule',
			s: [
				'7:15 Passing',
				'7:20 Period 0',
				'8:05 Passing',
				'8:10 Period 1',
				'8:55 Passing',
				'9:00 Period 2',
				'9:50 Brunch',
				'10:00 Passing',
				'10:05 Period 3',
				'10:50 Tutorial',
				'11:25 Passing',
				'11:30 Period 4',
				'12:15 Lunch',
				'13:00 Passing',
				'13:05 Period 5',
				'13:50 Passing',
				'13:55 Period 6',
				'14:40 Passing',
				'14:45 Period 7',
				'15:30 Free'
			]
		},
		weekend: {
			n: 'Weekend',
			s: []
		}
	}
}

module.exports = { schedule, school }

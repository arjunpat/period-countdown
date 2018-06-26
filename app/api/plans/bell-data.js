// bell data schema
var schema = {
	hits: [
		{
			new_load: true,
			device_id: 'HJnbG8jDRG',
			date: 1526165118086,
			prefs: {
				theme: 'asdf',
				period: 4,
				period_name: 'history'
			},
			// user agent and browser saved by device
			user: 'ajpat1234@gmail.com',
			referer: 'https://google.com', // referer
		}
	],
	devices: [
		{
			id: 'HJnbG8jDRG',
			specs: {
				user_agent: 'thing',
				browser: 'Chrome',
				platform: 'MacIntel',
			},
			date_registered: 1526165118086,
			registered_to: 'ajpat1234@gmail.com'
		}
	],
	errors: [
		{
			time: 1526165118086,
			user: 'ajpat1234@gmail.com',
			device_id: 'HJnbG8jDRG',
			error: {
				type: 'api',
				description: 'error_sending_analytics'
			}
		}
	],
	users: [
		{
			email: 'ajpat1234@gmail.com',
			first_name: 'Arjun',
			last_name: 'Patrawala',
			profile_pic: 'https://lh4.googleusercontent.com/-qrlLVeQgbJk/AAAAAAAAAAI/AAAAAAAAAAA/eDsCbPDRjOc/s96-c/photo.jpg',
			settings: {
				period_names: {
					period_0: 'Nothing',
					period_2: 'Journalism',
					period_3: 'Physical Education',
					period_4: 'Bio',
					period_6: 'Spanish',
					period_7: 'Survey Comp/Lit'
				},
				theme: [
					'default', 'default_reverse' // last being most recent, delete when too long
				]
			},
			devices: {
				'HJnbG8jDRG': 1526165118086 // date added to this profile
			},
			stats: {
				created: 1526165118086,
				viewed_last: 1526165118086,
				updated_period_names: [1526165118086, 1526165189886]
			}
		}
	]
}
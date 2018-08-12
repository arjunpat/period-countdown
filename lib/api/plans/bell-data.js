// bell data schema
var schema = {
	hits: [
		{
			new_load: true,
			device_id: 'HJnbG8jDRG',
			time: 1526165118086,
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
					0: 'Nothing',
					2: 'Journalism',
					3: 'Physical Education',
					4: 'Bio',
					5: undefined,
					6: 'Spanish',
					7: 'Survey Comp/Lit'
				},
				theme: 'MVHS Light'
			},
			devices: {
				'HJnbG8jDRG': 1526165118086 // date added to this profile
			},
			stats: {
				updated_period_names: [1526165118086, 1526165189886]
			}
		}
	]
}
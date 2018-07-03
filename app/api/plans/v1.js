// example request
// TODO: think about device id's and having associatied devices

// on load

'if device has id';
'POST /api/v1/init';
{
	data: {
		device_id: 'H23jfksdD'
	}
}
'response'
{
	success: true,
	data: {
		first_name: 'Arjun',
		last_name: 'Patrawala',
		email: 'ajpat1234@gmail.com',
		profile_pic: 'htasdf',
		settings: {
			period_names: {
				0: 'Nothing',
				1: '', // default name
				2: 'Journalism',
				3: 'Physical Education',
				4: 'Bio',
				5: 'History',
				6: 'Spanish',
				7: 'Survey Comp/Lit'
			},
			theme: [
				'default', 'default_reverse' // last being most recent
			]
		}
	}
}
// if not registered to a Google account yet
{
	success: true,
	data: {
		registered: false
	}
}



'if device lacks id';
'POST /api/v1/init'
{	
	data: {
		user_agent: 'thing',
		browser: 'Chrome',
		platform: 'MacIntel'
	}
}
// creates device
'response';
{
	success: true,
	data: {
		device_id: 'asJfiej2k3'
	}
}
// if creates a device and does not recieve a analytics recording in like 30 sec, delete the device b/c it is probably spam
// make sure that non_registered stupid computers get deleted after a while of no use (like a week or so)

// ALWAYS send analytics
'POST /api/v1/write/analytics';
{
	data: {
		device_id: 'asJfiej2k3',
		referer: 'https://www.google.com',
		speed: {
			
		},
		prefs: {
			theme: 'asdf',
			period: 4,
			period_name: 'history'
		},
		pathname: '/settings'
	}
}
'response';
{
	success: true
}
// don't allow another analytics request for like 30 seconds
// limit size of all requests

// make sure it can handle the accidental creation of same id twice


'POST /api/v1/write/login';
{
	data: {
		device_id: 'asJfiej2k3',
		account: {
			email: 'ajpat1234@gmail.com',
			first_name: 'Arjun',
			last_name: 'Patrawala',
			profile_pic: 'https;asdf/asd/fsadf'
		}
	}
}
'response';
{
	success: true,
	data: {
		status: 'new_user' // or returning_user
	}
}

'POST /api/v1/write/logout';
{
	data: {
		device_id: 'asJfiej2k3'
	}
}
// make sure to remove this also from the user profile as well
// you can keep the device in the database


// write something that automatically checks for preference updates (PrefManager) on client

'POST /api/v1/update/period_name'
{
	a: 'ajpat1234@gmail.com',
	data: {
		period_num: 0,
		name: 'hello' // has to be <= 20
	}
}

'POST /api/v1/update/theme';
{
	a: 'ajpat1234@gmail.com',
	data: {
		new_theme: 'default_reverse'
	}
}

'POST /api/v1/update/name'
{
	a: 'ajpat1234@gmail.com',
	data: {
		first_name: 'Arjun' // updateObjectWithValues
	}
}
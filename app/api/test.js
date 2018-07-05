const mysql = require('mysql');


var conn = mysql.createConnection({
	host: '127.0.0.1',
	user: 'bell_user',
	password: 'ABEqUJHEAyPkdeV3sE8TBeDFL', // dev password
	database: 'bell_data'
});

var query = (sql, vals) => new Promise((resolve, reject) => {
	conn.query(sql, vals, (err, res) => {
		if (err) reject(err);
		resolve(res);
	})
});


/*query(
	'INSERT INTO users (email, first_name, last_name, profile_pic, settings, devices, stats, created_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
	['ajpat1234@gmail.com', 'Arjun', 'Patrawala', 'httpspsppdppfds', '{}', '{}', '{}', Date.now()],
).then(results => console.log(results)).catch(err => console.log(err));*/

/*query(
	'INSERT INTO devices (device_id, user_agent, browser, platform, date_registered) VALUES (?, ?, ?, ?, ?)',
	['kdeV3sE8T', 'user agent here', 'Chrome', 'MacIntel', Date.now()]
).then(results => console.log(results)).catch(err => console.log(err));*/

query('SELECT * FROM devices WHERE device_id = ?', ['kdeV3sE8T']).then(results => console.log(results)).catch(err => console.log(err));

/*console.time('query');
query(
	'SELECT * FROM users WHERE email = ?',
	['ajpat1234@gmail.com']
).then(results => {
	if (results.length === 1) {
		let user = results[0];
		user.stats = JSON.parse(user.stats);
		user.devices = JSON.parse(user.devices);
		user.settings = JSON.parse(user.settings);
	}
}).catch(err => console.log(err));*/
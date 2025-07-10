-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
	device_id VARCHAR(30) PRIMARY KEY,
	time BIGINT UNSIGNED,
	platform VARCHAR(30),
	browser VARCHAR(30),
	user_agent TINYTEXT,
	registered_to VARCHAR(100),
	time_registered BIGINT UNSIGNED
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
	email VARCHAR(100) PRIMARY KEY,
	time BIGINT UNSIGNED,
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	profile_pic VARCHAR(1000),
	school VARCHAR(20),
	theme TINYINT UNSIGNED,
	period_names JSON,
	rooms JSON
);

-- Create hits table
CREATE TABLE IF NOT EXISTS hits (
	time BIGINT UNSIGNED PRIMARY KEY,
	device_id VARCHAR(30),
	leave_time BIGINT UNSIGNED,
	ip VARCHAR(50),
	pathname VARCHAR(100),
	referrer VARCHAR(100),
	version VARCHAR(20),
	school VARCHAR(20),
	period VARCHAR(100),
	dc SMALLINT UNSIGNED,
	pc SMALLINT UNSIGNED,
	rt SMALLINT UNSIGNED,
	dns SMALLINT UNSIGNED,
	tti SMALLINT UNSIGNED,
	ttfb SMALLINT UNSIGNED,
	user_theme TINYINT UNSIGNED,
	user_period VARCHAR(40)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
	time BIGINT UNSIGNED PRIMARY KEY,
	email VARCHAR(100),
	event VARCHAR(30),
	item_id VARCHAR(30),
	INDEX(email),
	INDEX(event),
	INDEX(item_id)
);

-- Create errors table
CREATE TABLE IF NOT EXISTS errors (
	db_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	time BIGINT UNSIGNED,
	device_id VARCHAR(30),
	error TEXT
);
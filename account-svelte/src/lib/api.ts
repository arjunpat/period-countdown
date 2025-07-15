const isProd = window.location.origin.includes('periods.io');
const serverHost = isProd ? 'https://api.periods.io' : 'http://localhost:8081';

async function get(url) {
	if (!url.includes('http')) {
		url = serverHost + url;
	}

	const startTime = performance.now();
	const res = await fetch(url, {
		credentials: 'include'
	});

	const json = await res.json();
	const loadTime = performance.now() - startTime;

	// Log load time for future analytics
	console.log(`GET ${url} took ${loadTime.toFixed(2)}ms`);

	return json;
}

async function post(url, json) {
	if (!url.includes('http')) {
		url = serverHost + url;
	}

	const startTime = performance.now();
	const res = await fetch(url, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(json)
	});

	const responseJson = await res.json();
	const loadTime = performance.now() - startTime;

	// Log load time for future analytics
	console.log(`POST ${url} took ${loadTime.toFixed(2)}ms`);

	return responseJson;
}

// Load available options (not user preferences)
async function loadSchools() {
	return await get('/schools');
}

async function loadThemes() {
	return await get('/themes');
}

async function loadPeriods(school) {
	return await get(`/periods/${school}`);
}

async function logout() {
	return await post('/v4/logout', {});
}

export { get, post, loadSchools, loadThemes, loadPeriods, logout };

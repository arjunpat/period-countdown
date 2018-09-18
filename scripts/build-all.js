const fs = require('fs');
const exec = require('child_process').exec;
const version = require('../package.json').version;
const prodChromeExtn = 'enpponilfcooflcegkodmpdgboooohjm'
const urlPrefix = 'https://periods.io'

console.log('Building this application will SCREW up this directory and remove unnecessary files, making it not setup for development.');
console.log('');
console.log('You have 5 seconds to exit out of this script before irreversible damage happens.');
console.log('We recommend you build right after cloning the latest version of this repo.');

setTimeout(() => {
	console.log('THE BUILDING HAS STARTED');
	
	
	fs.writeFileSync('./public/css/bundle.css', '');
	fs.appendFileSync('./public/css/bundle.css', fs.readFileSync('./public/css/main.css').toString());
	fs.appendFileSync('./public/css/bundle.css', fs.readFileSync('./public/css/index.css').toString());
	fs.appendFileSync('./public/css/bundle.css', fs.readFileSync('./public/css/not-found.css').toString());
	fs.appendFileSync('./public/css/bundle.css', fs.readFileSync('./public/css/settings.css').toString());
	fs.appendFileSync('./public/css/bundle.css', fs.readFileSync('./public/css/modal.css').toString());
	fs.appendFileSync('./public/css/bundle.css', fs.readFileSync('./public/css/notifications.css').toString());

	// service worker version and minification
	fs.writeFileSync(
		'./public/js/sw.js',
		(`const APP_VERSION = '${version}';//` + fs.readFileSync('./public/js/sw.js').toString()).replace(/\/\*(\*(?!\/)|[^*])*\*\//g, '').replace(/\/\/[^\n\r]+?(?:\*\)|[\n\r])/g, '').replace(/[\n\t\r]/g, '').replace(/this\./g, '\nthis.')
	);

	// extension connection
	fs.writeFileSync(
		'./public/extension-connection.html',
		fs.readFileSync('./public/extension-connection.html').toString().replace('dplbnpbafckhkoeoplmjchidbmlilpnm', prodChromeExtn)
	);

	// update extension with version and host
	fs.writeFileSync(
		'./extensions/chrome/js/main.js',
		`window.URL_PREFIX = '${urlPrefix}';window.VERSION = '${version}';` + fs.readFileSync('./extensions/chrome/js/main.js').toString().replace(/window\.URL_PREFIX.*/, '').replace(/window\.VERSION.*/, '')
	);

	// update chrome extension manifest with host
	let chromeManifest = JSON.parse(fs.readFileSync('./extensions/chrome/manifest.json').toString());
	chromeManifest.version = version;
	fs.writeFileSync(
		'./extensions/chrome/manifest.json',
		JSON.stringify(chromeManifest)
	);

	// index.html
	fs.writeFileSync(
		'./public/index.html',
		fs.readFileSync('./public/index.html').toString().replace(/\?v=.*"/g, '?v=' + version + '"')
	);


	exec('npm run build:client', (err, out) => {
		console.log(out);
		exec('./scripts/update-extension.sh', () => {
			exec('npm run build:extn', (err, out) => {
				console.log(out);

				// delete everything; hella cleanup

				exec("find public/css/ -type f -not -name 'bundle.css' -delete", () => {});

				// delete all js other than sw.js and bundle.js
				exec("find public/js/ -type f -not -name 'bundle.js' -not -name 'sw.js' -delete", () => {});
				exec("find extensions/chrome/js -type f -not -name 'bundle.js' -delete", () => {});

				// removing git to make sure no person pushes a built repo
				exec('rm -rf .git', () => {});
				exec('rm -rf scripts', () => {});
				exec('rm .gitignore && rm .babelrc && rm .env_sample && rm LICENSE && rm README.md && rm public/webpack.dev.config.js && rm public/webpack.prod.config.js && rm extensions/chrome/webpack.config.js', () => {});
				// remove .babelrc


				console.log('THINGS TO DO:');
				console.log('1. Update the <link> and <script> tags in index.html');
				console.log('2. Copy Google fonts into the css file');
				console.log('3. Remove elements inside of div#root and add them in js');
				console.log('4. Minify html, css, js');
			});
		});
	})


}, 5000);

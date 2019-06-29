import RequestManager from './RequestManager';
import Storage from './Storage';
import analytics from './analytics';
import logger from './logger';

import { removeServiceWorker, greeting, getVersion } from './extras';


analytics.setVersion(getVersion());
analytics.setPathname(window.location.pathname);
window.onbeforeunload = () => {
	analytics.leaving();
}

if (window.location.pathname === '/extn') {
	Storage.setChromeExtensionInstalled();
}

removeServiceWorker();
greeting();


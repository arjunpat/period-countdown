import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import RequestManager from './logic/RequestManager.js';
import Storage from './store/Storage.js';
import { analytics } from './logic/init.js';
import { getVersion, removeServiceWorker, greeting } from './logic/helpers.js';

let app = createApp(App).use(store).mount('#app');

app.$store.dispatch('init');
RequestManager.init().then(json => {
  if (json.success) {
    app.$store.dispatch('setGoogleAccount', json.data);
    analytics.set('user_theme', app.$store.getters.themeNum);
  } else {
    // not logged in
    if (Storage.prefsExist()) {
			Storage.clearPrefs();
			location.reload();
		}
  }

  analytics.set('school', app.$store.getters.schoolId);
}).catch(err => {
  err.location = 'RequestManager.init';
	RequestManager.sendError(err);
});

analytics.set('version', getVersion());
analytics.set('pathname', window.location.pathname);

window.onbeforeunload = () => {
	analytics.leaving();
}

removeServiceWorker();
greeting();
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueAnalytics from 'vue-analytics';
import { accountVersion, isProd } from '../../common';
import '@/assets/global.css';

Vue.config.productionTip = false;

Vue.use(VueAnalytics, {
  id: 'UA-143817963-1',
  router,
  set: [
    {
      field: 'dimension1',
      value: accountVersion
    }
  ],
  autoTracking: {
    exception: true
  },
  debug: {
    enabled: false,
    sendHitTask: isProd
  }
});

let instance = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
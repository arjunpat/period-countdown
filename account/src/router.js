import Vue from 'vue';
import Router from 'vue-router';
import Settings from './views/Settings.vue';
import Privacy from './views/Privacy.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/settings'
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: Privacy
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});

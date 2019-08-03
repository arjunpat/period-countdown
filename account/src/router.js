import Vue from 'vue';
import Router from 'vue-router';
import Settings from './views/Settings.vue';
import Profile from './views/Profile.vue';
import Logout from './views/Logout.vue';
import NotFound from './views/NotFound.vue';

Vue.use(Router);

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/settings'
    },
    {
      path: '/settings',
      component: Settings,
      meta: {
        title: 'settings — periods.io'
      }
    },
    {
      path: '/profile',
      component: Profile
    },
    {
      path: '/logout',
      component: Logout,
      meta: {
        title: 'logout — periods.io'
      }
    },
    {
      path: '/admin/analytics',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/Analytics.vue'),
      meta: {
        title: 'analytics — periods.io'
      }
    },
    {
      path: '/admin/chart',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/Chart.vue'),
      meta: {
        title: 'chart - periods.io'
      }
    },
    {
      path: '/schedules/home',
      component: () => import(/* webpackChunkName: "schedules" */'@/views/schedules/Home.vue'),
      meta: {
        title: 'schedules - periods.io'
      }
    },
    {
      path: '/schedules/new',
      component: () => import(/* webpackChunkName : "schedules */'@/views/schedules/New.vue'),
      meta: {
        title: 'new schedule - periods.io'
      }
    },
    {
      path: '/schedules/setup/:id',
      component: () => import(/* webpackChunkName : "schedules */'@/views/schedules/Setup.vue'),
      meta: {
        title: 'setup schedule - periods.io'
      }
    },
    {
      path: '/schedules/edit/:id',
      component: () => import(/* webpackChunkName : "schedules */'@/views/schedules/Edit.vue'),
      meta: {
        title: 'edit schedule - periods.io'
      }
    },
    {
      path: '*',
      component: NotFound
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) window.document.title = to.meta.title;
  next();
});

export default router;
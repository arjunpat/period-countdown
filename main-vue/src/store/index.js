import { createStore } from 'vuex';
import { isFreePeriod } from '../../../common.js';
import Storage from './Storage.js';

export default createStore({
  state: {
    theme: {
			theme: 0,
			n: 'Yellow gradient',
			b: 'linear-gradient(90deg, #fccb0b, #fc590b)',
			c: 'rgba(70, 0, 70, 0.18)',
			t: '#000'
		},
    periodNames: {},
    googleAccount: null,
    school: 'mvhs',
    rooms: {}
  },
  mutations: {
  },
  actions: {
    init({ state }) {
      let payload = Storage.prefsExist() ? Storage.getPrefs() : {};

      state.theme = payload.theme || state.theme;
      state.periodNames = payload.periodNames || state.periodNames;
      state.googleAccount = payload.googleAccount || state.googleAccount;
      state.school = payload.school || state.school;
      state.rooms = payload.rooms || state.rooms;
    },
    save({ state }) {
      Storage.setPrefs({
        theme: state.theme,
        periodNames: state.periodNames,
        googleAccount: state.googleAccount,
        school: state.school,
        rooms: state.rooms
      });
    },
    setGoogleAccount(context, payload) {
      context.state.googleAccount = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        profile_pic: payload.profile_pic,
        email: payload.email
      };
  
      context.state.periodNames = payload.period_names;
      context.state.theme = payload.theme;
      context.state.school = payload.school;
      context.state.rooms = payload.rooms;

      context.dispatch('save');
    }
  },
  getters: {
    themeNum(state) {
      return state.theme.theme;
    },
    isLoggedIn(state) {
      return !!state.googleAccount;
    },
    schoolId(state) {
      return state.school;
    },
    freePeriods(state) {
      let freePeriods = {};

      for (let key in state.periodNames) {
        freePeriods[key] = isFreePeriod(state.periodNames[key]);
      }

      return freePeriods;
    }
  }
});

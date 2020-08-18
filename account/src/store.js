import Vue from 'vue';
import Vuex from 'vuex';
import { get, post } from '@/utils.js';
import { getClientInformation } from '../../common.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    email: '',
  	profile_pic: '',
    school: '',
    admin: false,
    periods: [],
    schools: [],
    themes: [],
    themeNum: 0,
    first_name: '',
    last_name: '',
    meetingLinks: {},
  },  
  mutations: {
    setAccount(state, payload) {
      Object.assign(state, payload);
      state.themeNum = payload.theme.theme;

      for (let key in state.rooms) {
        if (state.rooms[key].type === 'url') {
          state.meetingLinks[key] = state.rooms[key].url;
        }
      }
    },
    setPeriods(state, payload) {
      state.periods = payload;
    },
    setPeriodName(state, { key, value }) {
      state.period_names[key] = value;
    },
    setMeetingLink(state, { key, value }) {
      state.meetingLinks[key] = value;
      if (value === '')
        delete state.meetingLinks[key];
    },
    setSchools(state, payload) {
      state.schools = payload;
    },
    setSchool(state, payload) {
      state.school = payload;
    },
    setThemes(state, payload) {
      state.themes = payload;
    },
    setThemeNum(state, payload) {
      state.themeNum = payload;
    }
  },
  actions: {
    async loadPeriods(context) {
      let res = (await get(`/periods/${context.state.school}`)).json;
      context.commit('setPeriods', res);
    },
    async loadSchools(context) {
      if (context.state.schools.length === 0) {
        let res = (await get('/schools')).json;
        context.commit('setSchools', res);
      }
    },
    async loadThemes(context) {
      if (context.state.themes.length === 0) {
        let res = (await get('/themes')).json;
        context.commit('setThemes', res);
      }
    },
    async saveSettings({ state }) {
      for (let key in state.period_names) {
        if (!state.periods.includes(key) || !state.period_names[key]) {
          delete state.period_names[key];
        } else {
          state.period_names[key] = state.period_names[key].trim();
        }
      }

      const rooms = {};
      for (let key in state.meetingLinks) {
        rooms[key] = {
          type: 'url',
          url: state.meetingLinks[key]
        };
      }

      await post('/v4/update-preferences', {
        period_names: state.period_names,
        theme: state.themeNum,
        school: state.school,
        rooms,
      });
    }
  },
  getters: {
    periodNames(state) {
      return state.period_names;
    },
    school(state) {
      return state.school;
    },
    theme(state) {
      return state.theme;
    },
    meetingLinks(state) {
      return state.meetingLinks
    },
  }
});

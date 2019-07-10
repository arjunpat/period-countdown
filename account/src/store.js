import Vue from 'vue';
import Vuex from 'vuex';
import { get, post, getClientInformation } from '../../common.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  	profile_pic: '',
    school: '',
    periods: [],
    schools: [],
    themes: []
  },  
  mutations: {
    setAccount(state, payload) {
      Object.assign(state, payload);
    },
    setPeriods(state, payload) {
      state.periods = payload;
    },
    setPeriodName(state, { key, value }) {
      state.period_names[key] = value;
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
    setTheme(state, payload) {
      state.theme = payload;
    }
  },
  actions: {
    async loadAccount(context) {
      let res = (await post('/v4/account', getClientInformation())).json;
      if (res.success) {
        context.commit('setAccount', res.data);
      }
    },
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
    }
  }
});

import Vue from 'vue';
import Vuex from 'vuex';
import { get, post, getClientInformation } from '../../common.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  	profile_pic: '',
    school: '',
    periods: []
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
    }
  },
  getters: {
    periodNames(state) {
      return state.period_names;
    }
  }
});

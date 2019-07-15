<template>
  <div style="padding: 20px;">
    <span class="title">Admin</span>
    <div style="display: flex; justify-content: space-between;">
      <input type="text" v-model="from" placeholder="From">
      <input type="text" v-model="to" placeholder="To">
      <button @click="go">Go</button>
    </div>
    <div v-if="loading">Loading</div>
    <div v-if="!loading && ana" style="padding: 20px;">
      <div style="display: flex; flex-wrap: wrap;" id="tiles">
        <div>
          <h2>Hits</h2>
          <h1 class="big">{{ numberWithCommas(ana.hits.count) }}</h1>
        </div>
        <div>
          <h1 style="font-weight: bold;">Unique</h1>
          <h3>Users: {{ numberWithCommas(ana.hits.unique_users) }}</h3>
          <h3>Devices: {{ numberWithCommas(ana.hits.unique_devices) }}</h3>
        </div>
        <div>
          <h1 style="font-weight: bold;">Devices</h1>
          <h3>Created: {{ numberWithCommas(ana.devices.count) }}</h3>
          <h3>Registered: {{ numberWithCommas(ana.devices.count_registered) }}</h3>
        </div>
        <Timing name="Dom Complete" :timing="ana.hits.dc" />
        <Timing name="DNS" :timing="ana.hits.dns" />
        <Timing name="Page Complete" :timing="ana.hits.pc" />
        <Timing name="Response Time" :timing="ana.hits.rt" />
        <Timing name="TTFB" :timing="ana.hits.ttfb" />
        <Timing name="TTI" :timing="ana.hits.tti" />
        <div>
          <h2>Hits from Users</h2>
          <h1 class="big">{{ numberWithCommas(ana.hits.hits_from_users) }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Timing from '@/components/admin/Timing.vue';
import { get, post } from '@/utils.js';

export default {
  components: {
    Timing
  },
  data() {
    return {
      ana: null,
      loading: false,
      from: '',
      to: ''
    }
  },
  created() {
    let d = new Date();
    this.from = new Date(d.toISOString().substring(0, 10)).toISOString().substring(0, 16);
    this.to = d.toISOString().substring(0, 16);
    this.go();
  },
  methods: {
    async go() {
      this.loading = true;
      this.ana = (await get(`/v4/admin/analytics?from=${new Date(this.from).getTime()}&to=${new Date(this.to).getTime()}`)).json.data;
      this.loading = false;
    },
    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    round(num, per) {
      per = 10 ** per;
      return Math.round(num * per) / per;
    }
  }
}
</script>

<style scoped>
input {
  outline: none;
  border: 1px solid blue;
  padding: 6px 14px;
  border-radius: 6px;
  width: 300px;
  margin-left: 10px;
}
button {
  border: 1px solid blue;
  padding: 10px;
  margin-left: 10px;
  outline: none;
  border-radius: 6px;
}

#tiles > div {
  width: 225px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 6px;
  margin: 10px;
  transition: all 200ms ease;
}
#tiles > div:hover {
  box-shadow: 2px 1px 6px 0 rgba(0,0,0,0.15);
}

.big {
  font-weight: bold;
  font-size: 50px;
}
</style>
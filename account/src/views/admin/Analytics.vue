<template>
  <div style="padding: 20px;">
    <span class="title">Admin</span>
    <br><br>
    <div style="display: flex; justify-content: space-between;">
      <input type="text" v-model="from" placeholder="From">
      <input type="text" v-model="to" placeholder="To">
      <button @click="go">Go</button>
    </div>
    <br><br>
    <div id="nav" :style="{ background, color }">
      <span @click="tab = 'hits'">Hits</span>
      <span @click="tab = 'devices'">Devices</span>
      <span @click="tab = 'users'">Users</span>
      <span @click="tab = 'events'">Events</span>
      <span @click="tab = 'errors'">Errors</span>
      <span @click="tab = 'timings'">Timings</span>
      <span @click="tab = 'totals'">Totals</span>
    </div>
    <div v-if="loading">Loading</div>
    <div v-if="!loading && ana" style="padding: 20px;">
      <span>Analysis Time: {{ ana.analysis_time }}ms</span><br>
      <span>Load Time: {{ loadTime }}ms</span><br><br>
      <div v-show="tab === 'hits'">
        <div class="tiles">
          <div @click="$router.push({ path: '/admin/chart' })" style="cursor: pointer;">
            <h2>Hits</h2>
            <h1 class="big">{{ numberWithCommas(ana.hits.count) }}</h1>
          </div>
          <div>
            <h2>Hits from users</h2>
            <h1 class="big">{{ numberWithCommas(ana.hits.hits_from_users) }}</h1>
          </div>
          <div>
            <h2>Unique Devices</h2>
            <h1 class="big">{{ numberWithCommas(ana.hits.unique_devices) }}</h1>
          </div>
          <div @click="tab = 'unique_users'" style="cursor: pointer;">
            <h2>Unique Users</h2>
            <h1 class="big">{{ numberWithCommas(ana.hits.unique_users.length) }}</h1>
          </div>
          <div>
            <h2>Max Hits By Device</h2>
            <h1 class="big">{{ numberWithCommas(ana.hits.top_devices[0] ? ana.hits.top_devices[0].count : 0) }}</h1>
          </div>
        </div>
        <br><br>
        <div class="tiles">
          <List title="Versions" :data="ana.hits.version" :total="ana.hits.count" />
          <List title="Pathnames" :data="ana.hits.pathname" :total="ana.hits.count" />
          <List title="Schools" :data="ana.hits.school" :total="ana.hits.count" />
          <List title="Periods" :data="ana.hits.period" :total="ana.hits.count" />
          <List title="Period Names" :data="ana.hits.user_period" :total="ana.hits.count" />
          <List title="Themes" :data="ana.hits.user_theme" :total="ana.hits.count" />
          <List title="Referrers" :data="ana.hits.referrer" :total="ana.hits.count" />
          <List title="IP" :data="ana.hits.ip" :total="ana.hits.count" />
        </div>
      </div>

      <div v-show="tab === 'devices'">
        <div class="tiles">
          <div>
            <h2>Created</h2>
            <h1 class="big">{{ numberWithCommas(ana.devices.count) }}</h1>
          </div>
          <div>
            <h2>Registered</h2>
            <h1 class="big">{{ numberWithCommas(ana.devices.count_registered) }}</h1>
          </div>
        </div>
        <br><br>
        <div style="display: flex;">
          <List title="Platforms" :data="ana.devices.platform" :total="ana.devices.count" />
          <List title="Browsers" :data="ana.devices.browser" :total="ana.devices.count" />
        </div>
        <br><br>
      </div>

      <div v-if="tab === 'users'">
        <div class="tiles">
          <div>
            <h2>Created</h2>
            <h1 class="big">{{ numberWithCommas(ana.users.list.length) }}</h1>
          </div>
        </div>
        <br><br>
        <div style="display: flex;">
          <List title="Themes" :data="ana.users.theme" :total="ana.users.list.length" />
          <List title="Schools" :data="ana.users.school" :total="ana.users.list.length" />
        </div>
        <br><br>
        <Users title="Users Added" :users="ana.users.list" />
      </div>

      <div class="tiles" v-show="tab === 'events'">
        <div @click="$router.push({ path: '/admin/chart' })" style="cursor: pointer;">
          <h2>Created</h2>
          <h1 class="big">{{ numberWithCommas(ana.events.count) }}</h1>
        </div>
        <div>
          <h2>Update Preferences</h2>
          <h1 class="big">{{ numberWithCommas(ana.events.upt_pref) }}</h1>
        </div>
        <div>
          <h2>Notifications On</h2>
          <h1 class="big">{{ numberWithCommas(ana.events.notif_on) }}</h1>
        </div>
      </div>

      <div v-show="tab === 'errors'">
        <div class="tiles">
          <div>
            <h2>Created</h2>
            <h1 class="big">{{ numberWithCommas(ana.errors.length) }}</h1>
          </div>
        </div>
        <div>
          <div v-for="error in ana.errors" style="border: 1px solid #ccc; border-radius: 6px; padding: 10px; margin: 10px;">
            <div><span>({{ error.db_id }}) {{ new Date(error.time).toLocaleString() }}</span> <span style="float: right;">{{ error.device_id }}</span></div>
            <br>
            <code v-html="textToHTML(error.error)"></code>
          </div>
        </div>
      </div>

      <div v-show="tab === 'totals'">
        <div class="tiles">
          <div>
            <h2>Hits</h2>
            <h1 class="big">{{ numberWithCommas(ana.totals.hits) }}</h1>
          </div>
          <div>
            <h2>Total Devices</h2>
            <h1 class="big">{{ numberWithCommas(ana.totals.devices.count) }}</h1>
          </div>
          <div>
            <h2>Users</h2>
            <h1 class="big">{{ numberWithCommas(ana.totals.users.count) }}</h1>
          </div>
          <div>
            <h2>Events</h2>
            <h1 class="big">{{ numberWithCommas(ana.totals.events) }}</h1>
          </div>
          <div>
            <h2>Errors</h2>
            <h1 class="big">{{ numberWithCommas(ana.totals.errors) }}</h1>
          </div>
          <div>
            <h2 style="font-size: 20px;">Reg Devices ({{ percent(ana.totals.devices.registered, ana.totals.devices.count) }})</h2>
            <h1 class="big">{{ numberWithCommas(ana.totals.devices.registered) }}</h1>
          </div>
        </div>
        <br><br>
        <div style="display: flex;">
          <List title="Themes (u)" :data="ana.totals.users.theme" :total="ana.totals.users.count" />
          <List title="Schools (u)" :data="ana.totals.users.school" :total="ana.totals.users.count" />
          <List title="Platforms (d)" :data="ana.totals.devices.platform" :total="ana.totals.devices.count" />
          <List title="Browsers (d)" :data="ana.totals.devices.browser" :total="ana.totals.devices.count" />
        </div>
      </div>

      <div v-if="tab === 'unique_users'">
        <Users title="Unique Users" :users="ana.hits.unique_users" />
      </div>

      <div class="tiles" v-show="tab === 'timings'">
        <Timing name="Dom Complete" :timing="ana.hits.dc" />
        <Timing name="DNS" :timing="ana.hits.dns" />
        <Timing name="Page Complete" :timing="ana.hits.pc" />
        <Timing name="Response Time" :timing="ana.hits.rt" />
        <Timing name="TTFB" :timing="ana.hits.ttfb" />
        <Timing name="TTI" :timing="ana.hits.tti" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { get, post } from '@/utils.js';
import Timing from '@/components/admin/Timing.vue';
import Users from '@/components/admin/Users.vue';
import List from '@/components/admin/List.vue';

export default {
  components: {
    Timing,
    Users,
    List
  },
  data() {
    return {
      ana: null,
      loading: false,
      from: '',
      to: '',
      tab: 'hits',
      background: 'transparent',
      color: '#000000',
      loadTime: 0
    }
  },
  mounted() {
    let d = new Date();
    d = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
    this.from = new Date(d.toISOString().substring(0, 10)).toISOString().substring(0, 16);
    // this.from = '2019-06-01T00:00'
    this.to = d.toISOString().substring(0, 16);
    this.go();

    this.background = this.theme.b;
    this.color = this.theme.t;
  },
  methods: {
    async go() {
      this.loading = true;
      
      let res = await get(`/v4/admin/analytics?from=${new Date(this.from).getTime()}&to=${new Date(this.to).getTime()}`);
      this.loadTime = this.round(res.loadTime);

      this.ana = res.json.data;
      this.ana.errors.reverse();
      this.ana.users.list.sort((a, b) => {
        return b.time - a.time;
      });

      this.loading = false;
    },
    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    textToHTML(text) {
      if (!text) {
        return 'null';
      }
      text = text.replace(/\\n/g, '\n');
      let div = document.createElement('div');
      div.innerText = text;
      text = div.innerHTML;
      text = text.replace(/    /g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      return text;
    },
    round(num, per = 3) {
      per = 10 ** per;
      return Math.round(num * per) / per;
    },
    percent(a, b) {
      return this.round(a / b * 100, 3) + '%';
    }
  },
  computed: {
    ...mapState(['theme'])
  }
}
</script>

<style scoped>
input {
  outline: none;
  border: 2px solid #f17600;
  padding: 6px 14px;
  border-radius: 6px;
  width: 300px;
  margin-left: 10px;
}
button {
  border: 2px solid #f17600;
  padding: 10px;
  margin-left: 10px;
  outline: none;
  border-radius: 6px;
}

#nav {
  border-radius: 5px;
  width: 60%;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
}

#nav > span {
  display: inline-block;
  cursor: pointer;
  padding: 10px;
}

#nav > span:hover {
  text-decoration: underline;
}

.tiles {
  display: flex;
  flex-wrap: wrap;
}

.tiles > div {
  width: 225px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 6px;
  margin: 10px;
  transition: all 200ms ease;
}
.tiles > div:hover {
  box-shadow: 2px 1px 6px 0 rgba(0,0,0,0.15);
}

.big {
  font-weight: bold;
  font-size: 50px;
}

.massive {
  font-weight: bold;
  font-size: 60px;
}
</style>
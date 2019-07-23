<template>
  <div style="padding: 20px;">
    <span class="title">Chart</span>
    <br><br>
    <div>
      <input type="checkbox" v-model="charts.hits" id="hits">
      <label for="hits">hits</label>
      <input type="checkbox" v-model="charts.events" id="events">
      <label for="events">events</label>
      <input type="checkbox" v-model="charts.users" id="users">
      <label for="users">users</label>
    </div>
    <br>
    <div style="display: flex;">
      <input type="text" v-model="from" placeholder="From">
      <input type="text" v-model="to" placeholder="To">
      <input type="text" v-model="buckets" placeholder="Buckets" style="width: 100px;">
      <button @click="go();">Go</button>
    </div>
    <br>
    <span>Bucketing time: {{ analysisTime }}ms</span><br>
    <span>Analysis time: {{ loadTime }}ms</span>

    <div style="width: 80%;">
      <canvas ref="chart" width="800" height="500"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
import { get, post } from '@/utils.js';

export default {
  data() {
    return {
      from: '',
      to: '',
      buckets: '',
      loadTime: '',
      analysisTime: '',
      table: 'hits',
      charts: {
        users: false,
        events: false,        
        hits: true,
      },
      data: {},
      chart: null
    }
  },
  mounted() {
    let d = new Date();
    d = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
    this.from = new Date(d.toISOString().substring(0, 10)).toISOString().substring(0, 16);
    // this.from = '2019-06-01T00:00'
    this.to = d.toISOString().substring(0, 16);
    this.buckets = 10;

    this.chart = new Chart(this.$refs.chart.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'hits',
            fill: true,
            data: [],
            backgroundColor: 'rgba(241, 116, 0, .4)',
            borderColor: 'rgba(241, 116, 0, 1)'
          },
          {
            label: 'events',
            fill: true,
            data: [],
            backgroundColor: 'rgba(0, 195, 195, .4)',
            borderColor: 'rgba(0, 195, 195, 1)'
          },
          {
            label: 'users',
            fill: true,
            data: [],
            backgroundColor: 'rgba(0, 0, 255, .4)',
            borderColor: 'rgba(0, 0, 255, 1)'
          }
        ]
      }
    });
  },
  methods: {
    async go() {
      let from = new Date(this.from).getTime() + 60 * 1000;
      let to = new Date(this.to).getTime();
      let buckets = parseInt(this.buckets);

      if (isNaN(from) || isNaN(to)) {
        return alert('NaN time');
      }

      for (let dataset of this.chart.data.datasets) {
        dataset.data = [];
      }

      for (let table of Object.keys(this.charts).filter(a => this.charts[a])) {
        let res = await this.getData(table, from, to, buckets);
        this.loadTime = this.round(res.loadTime);
        this.analysisTime = res.json.data.analysis_time;
        res = res.json.data.buckets;

        let data = [];
        for (let key in res) {
          data.push({
            time: parseInt(key),
            value: res[key]
          });
        }

        data.sort((a, b) => a.time - b.time);
        for (let i = 0; i < data.length; i++) {
          data[i].time = new Date(data[i].time).toLocaleString();
        }

        this.updateDataset(table, data);
      }
    },
    updateDataset(table, data) {
      this.chart.data.labels = data.map(d => d.time);
      this.chart.data.datasets.filter(d => d.label === table)[0].data = data.map(d => d.value);
      this.chart.update();
    },
    async getData(table, from, to, buckets) {
      let url = `/v4/admin/bucket/${table}?from=${from}&to=${to}&buckets=${buckets}`;
      if (!this.data[url]) {
        let res = await get(url);
        this.data[url] = {
          loadTime: res.loadTime,
          json: res.json
        }
      }

      return this.data[url];
    },
    round(num, per = 3) {
      per = 10 ** per;
      return Math.round(num * per) / per;
    },
  }
}
</script>

<style scoped>
input[type="text"] {
  outline: none;
  border: 2px solid #f17600;
  padding: 6px 14px;
  border-radius: 6px;
  width: 300px;
  margin-left: 10px;
}
input[type="checkbox"] {
  margin-right: 10px;
}

label {
  margin-right: 20px;
}

button {
  border: 2px solid #f17600;
  padding: 10px;
  margin-left: 10px;
  outline: none;
  border-radius: 6px;
}
</style>
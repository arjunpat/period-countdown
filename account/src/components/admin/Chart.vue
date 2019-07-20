<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between;">
      <input type="text" v-model="from" placeholder="From">
      <input type="text" v-model="to" placeholder="To">
      <input type="text" v-model="buckets" placeholder="Buckets" style="width: 100px;">
      <button @click="table = 'events'; go();">Events</button>
      <button @click="table = 'hits'; go();">Hits</button>
    </div>
    <br>
    <span>Bucketing time: {{ loadTime }}ms</span>

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
      table: 'hits',
      chart: null
    }
  },
  created() {
    let d = new Date();
    d = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
    this.from = new Date(d.toISOString().substring(0, 10)).toISOString().substring(0, 16);
    // this.from = '2019-06-01T00:00'
    this.to = d.toISOString().substring(0, 16);
    this.buckets = 10;
  },
  methods: {
    async go() {
      let from = new Date(this.from).getTime() + 60 * 1000;
      let to = new Date(this.to).getTime();

      if (isNaN(from) || isNaN(to)) {
        return alert('NaN time');
      }

      let res = await get(`/v4/admin/bucket/${this.table}?from=${from}&to=${to}&buckets=${parseInt(this.buckets)}`);
      this.loadTime = this.round(res.loadTime);
      res = res.json.data;

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

      if (this.chart) {
        this.chart.data.labels = data.map(d => d.time);
        this.chart.data.datasets[0].label = this.table;
        this.chart.data.datasets[0].data = data.map(d => d.value);
        this.chart.update();
      } else {
        this.chart = new Chart(this.$refs.chart.getContext('2d'), {
          type: 'line',
          data: {
            labels: data.map(d => d.time),
            datasets: [
              {
                label: this.table,
                fill: true,
                data: data.map(d => d.value),
                backgroundColor: 'rgba(241, 116, 0, .4)',
                borderColor: 'rgba(241, 116, 0, 1)'
              }
            ]
          }
        });
      }
    },
    round(num, per = 3) {
      per = 10 ** per;
      return Math.round(num * per) / per;
    },
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
</style>
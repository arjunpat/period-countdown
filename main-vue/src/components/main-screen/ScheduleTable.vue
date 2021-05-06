<template>
  <div>
    <span>Upcoming Periods</span>
    <table>
      <tbody>
        <tr v-for="each of timeline" :key="each[2]">
          <td>{{ each[0] }} <span v-if="each[1]">(<a :href="each[1]" target="_blank">Join</a>)</span></td>
          <td>{{ each[2] }} - {{ each[3] }}</td>
        </tr>
        <span v-if="timeline.length === 0" style="color: black; font-style: italic;">No more classes today</span>
      </tbody>
    </table>
  </div>
</template>

<script>
import { formatEpoch } from '@/logic/helpers.js';
import { timingEngine } from '@/logic/init.js';

export default {
  props: ['time'],
  data() {
    return {
      timeline: []
    }
  },
  methods: {
    generateTimeline(periods) {
      let tl = [];
      let currentTime = timingEngine.getCurrentTime();
      let currentDate = (new Date(currentTime)).setHours(0, 0, 0, 0);

      let added = 0;
      for (let i = 0; i < periods.length - 1 && added < 8; i++) {
        let p = periods[i];

        if (p.n !== 'Passing' && p.n !== 'Free') {
          if ((new Date(p.f)).setHours(0, 0, 0, 0) !== currentDate)
            continue;

          let url = this.$store.state.rooms[p.n] && this.$store.state.rooms[p.n].url;
          p.n = this.$store.state.periodNames[p.n] || p.n;

          if (p.n.length > 18) {
            p.n = p.n.slice(0, 18) + '..';
          }

          tl.push([p.n, url, formatEpoch(p.f), formatEpoch(periods[i + 1].f)])

          added++;
        }
      }

      return tl;
    }
  },
  watch: {
    time(time, old) {
      if (time.periodName !== old.periodName) {
        this.timeline = this.generateTimeline(timingEngine.getUpcomingEvents());
      }
    }
  }
}
</script>

<style scoped>
div {
  width: 350px;
  /* width: 250px; */
  /* background: #fff; */
  background: #ffffffee;
  position: absolute;
  border-radius: 8px;
  bottom: 95%;
  z-index: 10;
  padding: 20px;
  white-space: nowrap;
  transition: opacity 0.4s ease;
  box-shadow: 1px 1px 7px 1px rgba(0, 0, 0, 0.17);
  /* box-shadow: 0 0 100vmax 100vmax rgba(0,0,0,0.6); */
  /* opacity: 0; */
  /* display: none; */
}

/* div:after {
  content:'';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 0;
  height: 0;
  border-top: solid 10px #fff;
  border-left: solid 10px transparent;
  border-right: solid 10px transparent;
} */

div > span {
  text-align: center;
  color: black;
  font-weight: bold;
  font-size: 30px;
  margin: 0;
  display: block;
}

div > table {
  margin: 0 auto;
  margin-top: 20px;
}

div > table > tbody > tr > td {
  padding: 12px;
  font-size: 15px;
  color: #000;
}
</style>
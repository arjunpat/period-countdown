<template>
  <MainScreen :time="time" ref="main" />
</template>

<script>
import MainScreen from './components/MainScreen.vue';
import { timingManager, analytics, logger, scheduleBuilder, timingEngine } from './logic/init.js';
import RequestManager from './logic/RequestManager.js';

export default {
  name: 'App',
  components: {
    MainScreen
  },
  data() {
    return {
      time: {}
    }
  },
  mounted() {
    window.onresize = () => {
      this.$refs.main.dimension();
    }
  },
  created() {
    timingManager.init(this.$store.getters.schoolId);
    timingManager.setTimerPrepareMethod((school, schedule) => {
      scheduleBuilder.setFreePeriods(this.$store.getters.freePeriods || {});
      scheduleBuilder.init(school, schedule);
      
      let { presets, calendar, defaults } = scheduleBuilder.buildAll();
      timingEngine.init(presets, calendar, defaults);
    });

    timingManager.setLoop((firstRun = false) => {
      let time = timingEngine.getRemainingTime();
      time.periodName = this.$store.state.periodNames[time.period] || time.period;
      this.time = time;

      if (firstRun) {
        if (time.period !== time.periodName) {
          analytics.set('user_period', time.periodName);
        }
        analytics.set('period', time.period);
        this.$refs.main.dimension();
      }
      
      return timingManager.repeatLoopIn(1000);
    });

    logger.time('App', 'timer-init');
    timingManager.initTimer().then(() => {
      logger.timeEnd('App', 'timer-init');
    }).catch(err => {
      RequestManager.sendError(err);
      throw err;
    });
  }
}
</script>

<style>
/* all reset settings */
* {
	margin: 0;
	padding: 0;
	border: 0;
	font-family: 'Roboto', sans-serif;
	font-weight: normal;
}
a {
	color: inherit;
	text-decoration: none;
	transition: padding 150ms ease;
	cursor: pointer;
	border-bottom: 2px solid #fccb0b;
}

a:hover {
	padding-bottom: 2px;
}

body {
	overflow: hidden;
}

input,
button,
select,
textarea {
	font-family: inherit;
	font-size: inherit;
	line-height: inherit;
}

.material-icons {
	vertical-align: middle;
}

/* animations */
@keyframes updatePeriod {
	from {
		opacity: 0;
		transform: translate3d(0, 100%, 0);
	}
	to {
		opacity: 1;
		transform: translate3d(0, 0, 0);
	}
}

/* tooltip */
[tooltip] {
	position: relative;
	display: inline-block;
}

[tooltip]::after {
	content: attr(tooltip);
	position: absolute;
	left: 50%;
	background: rgba(0, 0, 0, .42);
	text-align: center;
	color: #fff;
	min-width: 65px;
	border-radius: 3px;
	font-size: 12px;
	pointer-events: none;
	padding: 4px 4px;
	z-index: 5;
	opacity: 0;
	top: 85%;
	margin-top: 8px;
	transform: translateX(-50%) translateY(0%);
	transition: opacity 150ms ease;
	transition-delay: 250ms;
}

[tooltip]:hover::after,
[tooltip]:hover::before {
	opacity: 1;
}
</style>

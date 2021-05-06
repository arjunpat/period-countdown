<template>
  <div>
    <div style="position: relative;">
      <Canvas
        :percentCompleted="time.percentCompleted || 0"
        :innerWidth="innerWidth"
      />
      <div style="position: absolute; width: 100%;">
        <div class="google-signin">
          <button v-if="!$store.getters.isLoggedIn" @click="goToSettings(true)">Sign in with Google</button>
          <div tooltip="Logout" v-else @click="goToSettings(false)"><img :src="imgUrl"></div>
        </div>
        <div
          style="bottom: 0; left: 0; position: fixed; padding: 50px; user-select: none;"
          :style="{ padding: Math.min(50, innerWidth / 22) + 'px' }"
        >
          
          <ScheduleTable :time="time" />
          <TimeLeft
            :currentPeriodText="time.periodName || ''"
            :dayType="time.dayType || ''"
            :timeLeft="timeLeft"
            :innerWidth="innerWidth"
          />
        </div>
        <div
          style="bottom: 0; right: 0; position: fixed;"
          :style="{ padding: Math.min(45, innerWidth / 18) + 'px' }"
        >
          <div class="settings-button-div" tooltip="Settings"
            :style="{
              padding: Math.min(18, innerWidth / 28) + 'px',
              background: theme.t
            }"
            @click="goToSettings(!$store.getters.isLoggedIn)"
          >
            <i class="material-icons" :style="{ color: settingsBtnColor }">settings</i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Canvas from './main-screen/Canvas.vue';
import TimeLeft from './main-screen/TimeLeft.vue';
import ScheduleTable from './main-screen/ScheduleTable.vue';
import { computeTimeStr, isExtn, isACrawler, openLink } from '@/logic/helpers.js';
import { generateGoogleSignInLink, isProd } from '@/../../common.js';

export default {
  components: {
    Canvas, TimeLeft, ScheduleTable
  },
  props: ['time'],
  data() {
    return {
      innerWidth: window.innerWidth + 2,
      timeLeft: ''
    }
  },
  methods: {
    dimension() {
      this.innerWidth = window.innerWidth;
    },
    goToSettings(signInFirst) {
      if (signInFirst) {
        openLink(generateGoogleSignInLink());
      } else {
        if (isProd)
          openLink('https://account.periods.io/settings');
        else
          openLink('http://localhost:8082');
      }
    },
  },
  watch: {
    time() {
      let { hours, minutes, seconds, periodName } = this.time;
      let timeString = computeTimeStr(hours, minutes, seconds);
      this.timeLeft = timeString;

      let documentTitle = `${timeString} \u2022 ${periodName}`;
      if (document.title !== documentTitle && !isACrawler && !isExtn)
        document.title = documentTitle;
    },
  },
  computed: mapState({
    theme: 'theme',
    imgUrl(state) {
      if (state.googleAccount) {
        let size = 70 * (window.devicePixelRatio || 1);
        return state.googleAccount.profile_pic + '?sz=' + size;
      }
      return null;
    },
    settingsBtnColor(state) {
      let { b } = state.theme;
      return b.substring(b.lastIndexOf('#'), b.lastIndexOf(')'));
    }
  })
}
</script>

<style scoped>
.google-signin {
  top: 0;
  right: 0;
  position: fixed;
  padding: 45px;
  user-select: none;
}

.google-signin > button {
  background: #1a73f6;
  font-family: 'Product Sans';
  border-radius: 8px;
  border: 0;
  outline: 0;
  color: #fff;
  padding: 12px 26px;
  float: right;
  font-size: 16px;
  transition: .2s background ease;
  cursor: pointer;
}

.google-signin > button:hover {
  background: #1362ca;
}

.google-signin > div > img {
  cursor: pointer;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  box-shadow: 0px 2px 10px 0 rgba(0,0,0,0.14), 0 1px 0px 0 rgba(0,0,0,0.12), 0px 2px 2px 0px rgba(0,0,0,0.2);
}

.google-signin > div > img:hover {
  opacity: 0.80;
}

.settings-button-div {
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 6px 10px 0 rgba(0,0,0,0.14),0 1px 18px 0 rgba(0,0,0,0.12),0 3px 5px -1px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

.settings-button-div:hover {
  box-shadow: 0 8px 10px 1px rgba(0,0,0,0.14),0 3px 14px 2px rgba(0,0,0,0.12),0 5px 5px -3px rgba(0,0,0,0.2);
  opacity: .88;
}

.settings-button-div > i {
  color: black;
  font-size: 40px;
  cursor: pointer;
  user-select: none;
}

@media (max-width: 375px) {
  .google-signin {
    padding: 25px;
  }
}
</style>

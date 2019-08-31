<template>
  <div class="main-div">
    <span class="title">Settings</span>
    <div v-if="email">
      <div class="settings-tabs">
        <div class="header">
          <div
            :class="{ selected: tab === 'period_names' }"
            style="padding-left: 0;"
            @click="tab = 'period_names'"
          >Class Names</div>
          <div
            :class="{ selected: tab === 'school' }"
            @click="tab = 'school'"
          >School</div>
          <div
            :class="{ selected: tab === 'theme' }"
            @click="tab = 'theme'"
          >Theme</div>
        </div>

        <div class="input-area">
          <transition name="tab-change">
            <PeriodNamesEnter v-if="tab === 'period_names'" />
            <SchoolEnter v-if="tab === 'school'" />
            <ThemeEnter v-if="tab === 'theme'" />
          </transition>
        </div>
      </div>
      <br><br>
      <SaveSettingsButton />
    </div>
    <div v-else style="display: flex; height: 50vh; width: 100%; justify-content: center; align-items: center;">
      <div class="loader"></div>
    </div>
    <p style="text-align: right;">Report bugs and ideas to <a href="mailto:help@periods.io">help@periods.io</a></p>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PeriodNamesEnter from '@/components/settings/PeriodNamesEnter.vue';
import SchoolEnter from '@/components/settings/SchoolEnter.vue';
import ThemeEnter from '@/components/settings/ThemeEnter.vue';
import SaveSettingsButton from '@/components/settings/SaveSettingsButton.vue';

export default {
  components: {
    PeriodNamesEnter,
    SchoolEnter,
    ThemeEnter,
    SaveSettingsButton,
  },
  data() {
    return {
      tab: 'period_names'
    }
  },
  watch: {
    tab() {
      this.$ga.event({
        eventCategory: 'settings.' + this.tab,
        eventAction: 'click'
      });
    }
  },
  computed: {
    ...mapState(['email'])
  }
}
</script>

<style scoped>

.main-div {
  padding: 20px;
}

.settings-tabs {
  width: 70%;
  margin: 0 auto;
  margin-top: 34px;
}

.header {
  display: flex;
  /*border-bottom: 3px solid #f17600;*/
}

.header > div {
  font-family: 'Product Sans';
  font-size: 30px;
  font-weight: normal;
  padding: 6px 18px;
  color: grey;
  cursor: pointer;
  transition: all 250ms ease;
  user-select: none;
}

.header > div:hover {
  color: #444;
}

.header > div.selected {
  color: #f17600;
  font-weight: bold;
}

.input-area {
  border: 2px solid #f17600;
  border-radius: 6px;
}

.tab-change-enter-active {
  transition: all 250ms ease;
}

.tab-change-active {
  transition-delay: .25s;
}

.tab-change-enter, .tab-change-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media only screen and (max-width: 500px) {
  .main-div {
    padding: 0;
  }

  .input-area {
    border: none;
    border-top: 2px solid #f17600;
    border-radius: 0;
  }

  .settings-tabs {
    width: 90%;
    margin-top: 20px;
  }

  .header > div {
    font-size: 20px;
  }
}

</style>

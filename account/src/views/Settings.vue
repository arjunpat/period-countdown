<template>
  <div style="padding: 20px;">
    <span class="title">Your Settings</span>
    <div>
      <div class="settings-tabs">

        <div class="header">
          <div
            :class="{ selected: tab === 'period_names' }"
            style="padding-left: 0;"
            @click="tab = 'period_names'"
          >Period Names</div>
          <div
            :class="{ selected: tab === 'school' }"
            @click="tab = 'school'"
          >School</div>
          <div
            :class="{ selected: tab === 'theme' }"
            @click="tab = 'theme'"
          >Theme</div>
        </div>

        <div style="border: 2px solid #f17600; border-radius: 6px;">
          <transition name="tab-change">
            <PeriodNamesEnter v-if="tab === 'period_names'" />
            <SchoolEnter v-if="tab === 'school'" />
            <ThemeEnter v-if="tab === 'theme'" />
          </transition>
        </div>
      </div>
    </div>
    <br><br>
    <SaveSettingsButton />
  </div>
</template>

<script>
import PeriodNamesEnter from '@/components/settings/PeriodNamesEnter.vue';
import SchoolEnter from '@/components/settings/SchoolEnter.vue';
import ThemeEnter from '@/components/settings/ThemeEnter.vue';
import SaveSettingsButton from '@/components/settings/SaveSettingsButton.vue';

export default {
  components: {
    PeriodNamesEnter,
    SchoolEnter,
    ThemeEnter,
    SaveSettingsButton
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
  }
}
</script>

<style scoped>
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
</style>

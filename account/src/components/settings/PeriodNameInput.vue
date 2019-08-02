<template>
  <div class="material-input-group">
    <input
      :id="id"
      maxlength="20"
      autocomplete="off"
      class="material-input"
      :class="{ 'has-value': !!value }"
      v-model="value"
    >
    <label :for="id">
      {{ periodName }} {{ isFree ? '- removed from schedule' : '' }}
    </label>
  </div>
</template>

<script>
import { isFreePeriod } from '../../../../common';

export default {
  data() {
    return {
      id: Math.random().toString(36).substring(7),
      isFree: false,
      firstRun: true,
      timeoutId: null,
      value: ''
    }
  },
  props: ['periodName'],
  created() {
    this.value = this.$store.getters.periodNames[this.periodName];
  },
  watch: {
    value() {
      this.isFree = isFreePeriod(this.value);
      this.$store.commit('setPeriodName', { key: this.periodName, value: this.value });
      
      if (!this.firstRun) {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
          this.$ga.event({
            eventCategory: 'settings.period_names.input',
            eventAction: 'changed',
            eventLabel: this.periodName
          });
        }, 5000);
      }
      
      this.firstRun = false;
    }
  }
}
</script>
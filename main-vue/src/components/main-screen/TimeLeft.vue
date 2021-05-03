<template>
  <span
    style="padding-left: 15px; font-family: 'Product Sans';"
    :style="{ fontSize: subtextSize + 'px' }"
  >
    {{ dayType }}
    &nbsp;&#x25B8;&nbsp;
    {{ currentPeriodText }}
  </span>
  <span
    :style="{ fontSize: timeLeftSize + 'px', display: 'block' }"
  >{{ timeLeft }}</span>
</template>

<script>
import { isExtn } from '@/logic/helpers.js';

export default {
  props: {
    timeLeft: String,
    dayType: { type: String, default: '' },
    currentPeriodText: { type: String, default: '' },
    innerWidth: Number
  },
  data() {
    return {
      timeLeftSize: 230,
      subtextSize: 50
    }
  },
  mounted() {
    this.dimension();
  },
  methods: {
    dimension() {
      if (isExtn) {
        this.timeLeftSize = Math.min(120, this.innerWidth / (this.timeLeft.length - 2));

        let subtextLength = this.dayType.length + 3 + this.currentPeriodText.length;
        this.subtextSize = Math.min(50, (this.innerWidth / subtextLength) / .6)
      } else {
        this.subtextSize = Math.min(55, this.innerWidth / 16);

        if (this.innerWidth > 450) {
          this.timeLeftSize = Math.min(170, this.innerWidth / (this.timeLeft.length - 3));
        } else {
          this.timeLeftSize = Math.min(120, this.innerWidth / (this.timeLeft.length - 2));
        }
      }
    }
  },
  watch: {
    innerWidth() {
      this.dimension();
    }
  }
}
</script>

<style scoped>

</style>
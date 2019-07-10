<template>
  <div>
    <br><br><br>
    <div style="display: flex; margin: 0 auto;">
      <div v-for="column in columns" style="padding: 0 24px; flex: 1;">
        <PeriodNameInput v-for="period in column" :key="period" :period-name="period" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PeriodNameInput from '@/components/PeriodNameInput.vue';

export default {
  components: {
    PeriodNameInput
  },
  computed: {
    ...mapState(['periods', 'school']),
    columns () {
      let columns = []
      let mid = Math.ceil(this.periods.length / 2)
      for (let col = 0; col < 2; col++) {
        columns.push(this.periods.slice(col * mid, col * mid + mid))
      }
      return columns
    },
  },
  watch: {
    school(old, value) {
      if (this.school && old !== value) {
        this.$store.dispatch('loadPeriods');
      }
    }
  }
}
</script>
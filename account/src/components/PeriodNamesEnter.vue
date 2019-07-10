<template>
  <div>
    <PeriodNameInput v-for="period of periods" :period-name="period" />
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
    ...mapState(['periods', 'school'])
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
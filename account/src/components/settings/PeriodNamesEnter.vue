<template>
  <div>
    <div class="margin-top"></div>
    <div class="container">
      <div v-for="column in columns" class="col">
        <PeriodNameInput v-for="period in column" :key="period" :period-name="period" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PeriodNameInput from './PeriodNameInput.vue';

export default {
  components: {
    PeriodNameInput
  },
  created() {
    if (this.school)
      this.$store.dispatch('loadPeriods');
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
    school() {
      this.$store.dispatch('loadPeriods');
    }
  }
}
</script>

<style scoped>
.margin-top {
  height: 57px;
}

.container {
  display: flex;
  margin: 0 auto;
}

.col {
  padding: 0 24px;
  flex: 1;
}

@media only screen and (max-width: 500px) {
  .margin-top {
    height: 35px;
  }

  .container {
    display: block;
  }

  .col {
    padding: 0 10px;
  }
}

</style>
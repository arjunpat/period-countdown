<template>
  <div class="main">
    <span>Your school is how we determine which schedule to use.</span>
    <br><br>
    <select id="school-select" v-model="value">
      <option v-for="school in schools" :key="school.id" :value="school.id">{{ school.n }}</option>
    </select>
    <br><br>
    <div style="font-weight: bold;">Is your school not listed as an option?</div>
    <div style="margin-left: 10px; margin-top: 6px;">
      <div>1. <a href="https://docs.google.com/forms/d/e/1FAIpQLSfx5M5IXoaqotrffX4yU1YEBwVl8X7xyPqMpsdBCULY7na4aw/viewform" target="_blank">Request your school</a> <span style="font-style: italic;">OR</span></div><br>
      <div>2. <a href="https://github.com/arjunpat/timing-data" target="_blank">Add your school yourself</a> (requires basic coding experience)</div>
    </div>
    <div style="height: 250px;"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  created() {
    this.$store.dispatch('loadSchools');
  },
  computed: {
    ...mapState(['schools']),
    value: {
      get() {
        return this.$store.getters.school;
      },
      set(val) {
        this.$store.commit('setSchool', val);
        this.$ga.event({
          eventCategory: 'settings.school.input',
          eventAction: 'changed',
          eventLabel: val
        });
      }
    }
  }
}
</script>

<style scoped>

.main {
  padding: 20px;
  font-weight: bold;
}

@media only screen and (max-width: 500px) {
  .main {
    padding: 10px;
    padding-top: 20px;
  }
}

#school-select {
  display: block;
  background: #eaeaea;
  color: #000;
  border: none;
  border-radius: 0;
  padding: 2px 15px 2px 10px;
  cursor: pointer;
  margin: 0;
  width: 250px;
  height: 30px;
  font-size: 16px;
  outline: 0;
}
</style>
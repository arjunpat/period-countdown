<template>
  <div style="padding: 20px;">
    <select id="theme-select" v-model="value">
      <option v-for="(theme, index) in themes" :value="index">{{ theme.n }}</option>
    </select>
    <br>
    <span>This is a sample of what <span style="font-style: italic;">{{ themeName }}</span> looks like:</span>
    <br><br>
    <ThemeDisplay :theme="themeToDisplay" />
    <br>
    <a href="https://docs.google.com/forms/d/e/1FAIpQLSd4Uf1aRuWsvvFAn4gQKQwP3P4JpiGoDFrEMwzjhti9X55wDQ/viewform?usp=sf_link" target="_blank">Request a theme</a>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ThemeDisplay from './ThemeDisplay.vue';

export default {
  data() {
    return {
      value: '0',
      themeName: '',
      themeToDisplay: {}
    }
  },
  components: {
    ThemeDisplay
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      await this.$store.dispatch('loadThemes');
      this.value = this.$store.getters.theme.theme;
    }
  },
  watch: {
    value() {
      let val = parseInt(this.value);
      this.$store.commit('setTheme', this.themes[val]);
      console.log(JSON.stringify(this.$store.getters.theme));
      this.themeToDisplay = this.themes[val];
      this.themeName = this.themeToDisplay.n;
    }
  },
  computed: {
    ...mapState(['themes'])
  }
}
</script>

<style scoped>
#theme-select {
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
  font-size: 20px;
  outline: 0;
}

</style>
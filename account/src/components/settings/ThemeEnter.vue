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
      themeName: '',
      themeToDisplay: {},
    }
  },
  components: {
    ThemeDisplay
  },
  async created() {
    await this.$store.dispatch('loadThemes');
    this.show();
  },
  methods: {
    show() {
      this.themeToDisplay = this.themes[this.value];
      this.themeName = this.themeToDisplay.n;
    }
  },
  computed: {
    ...mapState(['themes']),
    value: {
      get() {
        return this.$store.state.themeNum;
      },
      set(value) {
        this.$store.commit('setThemeNum', parseInt(value));
      }
    }
  },
  watch: {
    value() {
      this.show();
    },
    themes() {
      this.show();
    }
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
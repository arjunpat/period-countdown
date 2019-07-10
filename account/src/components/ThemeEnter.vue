<template>
  <div style="padding: 20px;">
    <select id="theme-select" v-model="value">
      <option v-for="(theme, index) in themes" :value="index">{{ theme.n }}</option>
    </select>
    <br>
    <span>Sample:</span>
    <br><br>
    <div
      :style="{
        background,
        borderRadius: '8px',
        height: '300px',
        boxShadow: '0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }"
    >
      <span
        :style="{
          color: textColor,
          position: 'absolute',
          bottom: '94px',
          left: '20px',
          fontSize: '20px',
          fontFamily: 'Product Sans'
        }"
      >Schedule A ▸ Period 1</span>
      <span
        :style="{
          color: textColor,
          position: 'absolute',
          bottom: '4px',
          left: '14px',
          fontSize: '80px'
        }"
      >12:53</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      value: '0',
      textColor: '#000',
      background: 'transparent'
    }
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
      this.$store.commit('setTheme', this.themes[this.value]);
      this.textColor = this.themes[this.value].t;

      try {
        let theme = this.themes[this.value].b;

        if (typeof theme === 'object') {
          let str = 'linear-gradient(90deg';
          for (let i = 0 ; i < theme.stops.length; i++) {
            str += ', ' + theme.stops[i];
          }
          str += ')';

          this.background = str;;
        } else {
          this.background = theme;
        }
      } catch (e) {}
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
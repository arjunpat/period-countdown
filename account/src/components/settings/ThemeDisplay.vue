<template>
  <div
    :style="{
      background,
      borderRadius: '8px',
      height: '275px',
      boxShadow: '0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2)',
      transition: 'all 0.2s ease',
      position: 'relative',
      userSelect: 'none',
      maxWidth: '550px',
      margin: '0 auto'
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
    >1:12:53</span>
  </div>
</template>

<script>
  
export default {
  props: ['theme'],
  data() {
    return {
      textColor: '#000',
      background: 'transparent'
    }
  },
  watch: {
    theme() {
      try {
        this.textColor = this.theme.t;
        this.themeName = this.theme.n;

        this.background = this.theme.b;
      } catch (e) {
        console.log(e);
      }
    }
  }
}
</script>
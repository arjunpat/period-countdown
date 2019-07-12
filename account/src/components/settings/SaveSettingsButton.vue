<template>
  <button
    class="material-form-button"
    @click="save"
    :disabled="disabled"
  >Save All Settings</button>
</template>

<script>

export default {
  data() {
    return {
      disabled: false
    }
  },
  created() {
    document.onkeydown = e => {
      // support ctrl/cmd + s as saving
      if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        if (!this.disabled) {
          this.save();
        }
      }
      console.log('hi');
    }
  },
  destroyed() {
    document.onkeydown = null;
  },
  methods: {
    async save() {
      this.disabled = true;
      await this.$store.dispatch('saveSettings');
      setTimeout(() => {
        this.disabled = false;
      }, 2000);
    }
  }
}
</script>

<style scoped>
.material-form-button {
  background: #fccb0b;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  border: none;
  height: 36px;
  padding: 0 16px;
  border-radius: 4px;
  outline: none;
  font-family: 'Product Sans', 'Roboto', sans-serif;
  cursor: pointer;
  width: 160px;
  transition: background 0.2s ease;
  margin: auto;
  display: block;
}

.material-form-button:hover {
  box-shadow: 0 1px 1px 0 rgba(252, 203, 11, 0.45), 0 1px 3px 1px rgba(252, 203, 11, 0.3);
  background: #ffd014;
}

.material-form-button:disabled {
  background: #a6a6a6;
  cursor: not-allowed;
}
</style>
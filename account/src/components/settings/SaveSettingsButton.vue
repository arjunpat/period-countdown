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
    }
  },
  destroyed() {
    document.onkeydown = null;
  },
  methods: {
    async save() {
      this.disabled = true;
      await this.$store.dispatch('saveSettings');
      this.$ga.event({
        eventCategory: 'settings.save_settings_button',
        eventAction: 'click'
      });
      setTimeout(() => {
        this.disabled = false;
      }, 2000);
    }
  }
}
</script>
<template>
  <div class="material-input-group">
    <input
      :id="id"
      maxlength="500"
      autocomplete="off"
      class="material-input"
      :class="{ 'has-value': !!value }"
      v-model="value"
    >
    <label :for="id">
      {{ periodName }} URL
    </label>
    <div v-show="!validUrl" style="font-size: 10px; color: red; margin-top: 5px;">Invalid URL</div>
  </div>
</template>

<script>
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export default {
  data() {
    return {
      id: Math.random().toString(36).substring(7),
      validUrl: true,
      firstRun: true,
      timeoutId: null,
      value: ''
    }
  },
  props: {
    periodName: { type: String, required: true },
    url: { type: Boolean }
  },
  created() {
    this.value = this.$store.getters.meetingLinks[this.periodName] || '';
  },
  watch: {
    value() {
      this.validUrl = this.value === '' || urlRegex.test(this.value);
      this.$store.commit('setMeetingLink', { key: this.periodName, value: this.value });
      
      if (!this.firstRun) {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
          this.$ga.event({
            eventCategory: 'settings.period_names.meeting_link_input',
            eventAction: 'changed',
            eventLabel: this.periodName
          });
        }, 5000);
      }
      
      this.firstRun = false;
    }
  }
}
</script>
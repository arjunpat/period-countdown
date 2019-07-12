<template>
  <div class="material-input-group">
    <input :id="id" maxlength="20" autocomplete="off"
      class="material-form-control"
      :class="{ 'has-value': !!value }"
      v-model="value"
    >
    <label :for="id">
      {{ periodName }} {{ isFree ? '- removed from schedule' : '' }}
    </label>
  </div>
</template>

<script>
import { isFreePeriod } from '../../../../common.js';

export default {
  data() {
    return {
      id: Math.random().toString(36).substring(7),
      isFree: false,
      value: ''
    }
  },
  props: ['periodName'],
  created() {
    this.value = this.$store.getters.periodNames[this.periodName];
  },
  watch: {
    value() {
      this.isFree = isFreePeriod(this.value);
      this.$store.commit('setPeriodName', { key: this.periodName, value: this.value });
    }
  }
}
</script>

<style scoped>
.material-input-group {
  position: relative;
  margin: auto;
  margin-bottom: 60px;
}
input {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 35px;
  font-size: 16px;
  border: none;
  border-bottom: 1px solid #d9d9d9;
  background-color: transparent;
  border-radius: 0;
}
input:disabled {
  cursor: not-allowed;
}
input:focus {
  outline: none;
  border-width: 2px;
  border-color: #f17600;
  transition: all .2s ease-out;
}
.has-value:valid + label {
  top: -15px;
  color: #757575;
  font-size: 12px;
}
.material-form-control:focus + label {
  top: -15px;
  color: #f17600;
  font-size: 12px;
}
.material-form-control + label {
  position: absolute;
  top: 10px;
  left: 3px;
  font-size: 16px;
  color: #999999;
  transition: all .2s ease-out;
  z-index: 2;
  cursor: text;
  user-select: none;
}
</style>
<template>
  <div class="list">
    <h2 class="big">{{ title }}</h2>
    <br>
    <div v-for="each in data">
      <span>{{ typeof each.value === 'object' ? 'null' : each.value }}</span>
      <span style="float: right;">{{ each.count }} <span style="color: #444;">({{ percent(each.count, total) }})</span></span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'data', 'total'],
  methods: {
    round(num, per = 3) {
      per = 10 ** per;
      return Math.round(num * per) / per;
    },
    percent(a, b) {
      return this.round(a / b * 100, 3) + '%';
    }
  }
}
</script>

<style scoped>
.list {
  width: 300px;
  margin: 15px;
}

.list .big {
  font-size: 35px;
  font-weight: bold;
}

.list > div {
  padding: 4px;
  border-bottom: 1px solid #ccc;
}
</style>
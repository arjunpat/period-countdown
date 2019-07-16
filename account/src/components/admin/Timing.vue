<template>
  <div>
    <h2 style="font-weight: bold;">{{ name }}</h2>
    <br>
    <h3>Max: {{ timing.max }}</h3>
    <h3>Min: {{ timing.min }}</h3>
    <h3>Avg: {{ round(timing.avg, 3) }}</h3>
    <h3>STD: {{ round(timing.std, 3) }}</h3>
  </div>
</template>

<script>

export default {
  props: ['name', 'timing'],
  methods: {
  	round(num, per) {
      per = 10 ** per;
      return Math.round(num * per) / per;
    }
  }
}

</script>
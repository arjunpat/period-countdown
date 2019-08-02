<template>
	<div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
    <div style="background: #f17600; width: 85%; padding: 40px 40px; border-radius: 12px;">
      <span style="font-size: 100px; color: #fff; font-weight: bold;">Bro. This is not a page.</span><br>
      <span style="padding-left: 10px; font-size: 50px; color: #fff;">Don't worry. We'll send you back to the settings page in {{ num }} seconds.</span>
    </div>
	</div>
</template>

<script>

export default {
  data() {
    return {
      num: 10
    }
  },
  mounted() {
    this.hi();
  },
  methods: {
    hi() {
      setTimeout(() => {
        this.num--;
        if (this.num === 0) {
          this.$router.push({ path: '/settings' });
        } else {
          this.hi();
        }
      }, 1000);
    }
  }
}
</script>
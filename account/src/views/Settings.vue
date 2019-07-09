<template>
  <div style="padding: 20px;">
    <span id="title">Settings</span>
  </div>
</template>

<script>
export default {
}
</script>

<style scoped>
#title {
  font: 88px 'Product Sans';
  color: black;
  padding: 4px;
  margin-top: 16px;
  margin-left: 14px;
  font-weight: bold;
  display: inline-block;
  user-select: none;
  background-image: linear-gradient(120deg, #fccb0b 0%, #fc590bad 100%);
  background-repeat: no-repeat;
  background-size: 100% 20px;
  background-position: 0 86%;
  animation: settingsUnderlineAnimation 2s cubic-bezier(0.67, 0.24, 0.22, 0.96);
}
@keyframes settingsUnderlineAnimation {
  0% {
    background-size: 0 0;
  }
  30% {
    background-size: 0 0;
  }
  60% {
    background-size: 100% 100%;
  }
  90% {
    background-size: 100% 100%;
  }
  100% {
    background-size: 100% 20px;
  }
}
</style>
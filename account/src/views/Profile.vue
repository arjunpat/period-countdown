<template>
  <div style="padding: 20px;">
    <span class="title">Profile</span>
    <div style="padding: 40px;">
      <h1 style="font-weight: bold;">Hi {{ first_name }},</h1><br>
      <p>We don't store much personal information about you, but here is what we have:</p>
      <p>first name: {{ first_name }}</p>
      <p>last name: {{ last_name }}</p>
      <p>email: {{ email }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['email', 'first_name', 'last_name', 'profile_pic'])
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
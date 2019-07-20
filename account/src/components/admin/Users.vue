<template>
  <div>
    <h1 style="font-weight: bold; font-size: 50px;">{{ title }}</h1>
    <div v-for="user in users" style="border-top: 1px solid #ccc; padding: 10px; margin: 10px; padding-bottom: 5px;">
      <div style="display: flex;">
        <img :src="user.profile_pic" style="height: 90px;">
        <div style="margin-left: 14px;">
          <div>
            <span>{{ user.first_name }} {{ user.last_name }} — {{ user.email }} — {{ new Date(user.time).toLocaleString() }}</span>
          </div>
          <br>
          <span>School: {{ user.school || 'null' }}</span><br>
          <span>Theme: {{ user.theme || 'null' }}</span><br>
          <code v-html="textToHTML(user.period_names)"></code>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  
export default {
  props: ['title', 'users'],
  methods: {
    textToHTML(text) {
      if (!text) {
        return 'null';
      }
      text = text.replace(/\\n/g, '\n');
      let div = document.createElement('div');
      div.innerText = text;
      text = div.innerHTML;
      text = text.replace(/    /g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      return text;
    },
  }
}
</script>

<style scoped>
code {
  font-family: monospace;
}
</style>
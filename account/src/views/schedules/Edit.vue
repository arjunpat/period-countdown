<template>
  <div style="padding: 20px;">
    <span class="title">Edit Schedule</span>
    <div style="margin-top: 10px; padding: 20px;">
      <h1>{{ name }}</h1>
      <h2 style="background: #dfdfdf; border-radius: 4px; padding: 4px 8px; display: inline-block;">{{ id }}</h2>
      <br><br>
      <div style="padding: 15px; background: #ddd; border-radius: 6px; border: 3px solid red;">
        <h2>A bit of information about editing these files</h2>
        <p>There are two files: schedule and school. Here is some info about editing each:</p>
        <br>
        <div style="margin-left: 30px;">
          <h3>the schedule file</h3>
          <p>1) Users receive a new copy of this file about every 30 minutes, so changes you make here will be available more quickly.</p>
          <p>2) This is where the calendar and preset patterns are stored. When adding a new item to the calendar, it is best to copy and paste an old calendar event and change what needs to be changed.</p>
          <p>3) See an example of the syntax for this file at this link.</p>
          <p>4) See an example of this file for Mountain View High School at this link.</p>
        </div>
        <br><br>
        <div style="margin-left: 30px;">
          <h3>the school file</h3>
          <p>1) Users receive a new copy of this file about every 6 hours, so changes you make here will take a while to reach client comptuers.</p>
          <p>2) This is where all of the schedules will be stored (sorry, this file wasn't named very well). If you want to add a new schedule, add it here. It is best to copy and paste an old schedule and edit the id, name, and schedule.</p>
          <p>3) Remember: all schedules have both an id and a name. Names are displayed to the user. Ids are used to internally refer to a schedule</p>
          <p>4) See an example of the syntax for this file at this link.</p>
          <p>5) See an example of this file for Mountain View High School at this link.</p>
        </div>
      </div>

      <br><br><br><br>
      <div style="display: flex; justify-content: space-between;">
        <div style="width: calc(50% - 10px);">
          <h3>school</h3>
          <textarea :value="school"></textarea>
        </div>
        <div style="width: calc(50% - 10px);">
          <h3>schedule</h3>
          <textarea :value="schedule"></textarea>
        </div>
      </div>
      <br><br><br><br>
      <span style="font-size: 24px; color: #444;">explain your changes in a few words</span><br><br>
      <div class="material-input-group" style="display: inline-block; margin-right: 30px; width: 500px; margin-bottom: 0;">
        <input
          maxlength="100"
          class="material-input"
          :class="{ 'has-value': !!msg }"
          v-model="msg"
          placeholder="Ex: added minimum day schedule"
        >
      </div>
      <br><br><br>
      <button class="material-form-button">Save Changes</button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      name: 'Mountain View High School',
      id: this.$route.params.id,
      school: '',
      schedule: '',
      msg: ''
    }
  }
}
</script>

<style scoped>
textarea {
  background: #ddd;
  font-family: monospace;
  width: 100%;
  height: 250px;
  padding: 10px;
  border-radius: 4px;
  color: black;
  outline: none;
}
</style>
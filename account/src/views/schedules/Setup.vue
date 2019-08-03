<template>
  <div style="padding: 20px;">
    <span class="title">Setup</span>
    <div style="margin-top: 20px; padding: 20px;">
      <h1>Read this first!</h1>
      <p>Schedules are maintained using a <strong>computer language called YAML.</strong> Although it is pretty easy to learn YAML, any experience with computer code will be incredibly beneficial. <strong>No experience</strong> with computer code is technically required, however.</p><br>
      <p>If you are a quick learner, you should be able to get a basic understanding of YAML by just looking at code examples. If not, you might want to consider watching some YouTube videos on the language or letting another person at your school take on these tasks.</p><br>
      <p>This page here will try to help you avoid using YAML to setup, but <strong>you will need to start writing YAML after this.</strong></p>
      <br><br><br>
      <h1>Set up periods</h1>
      <p>Each school has a different set of periods that students attend. Some have periods from 0 to 7, others 1 to 7, others 1 to 8, others A to E, etc. You need to specifiy this information for your school. Each period you add in this section will <strong>correspond to a text box a user can use to customize their period names</strong> on the settings page.</p>
      <br>
      <p>Please add these periods in the most logical order (usually chronological order). Ex: "Period 1" should be added before "Period 2". If you make a mistake, you can use the <strong>red X</strong> to remove a period.</p>
      <br>
      <p>We've already started filling this section out for you by adding periods 0-7. If this does not suit your school at all, just remove all periods with the red X and add your own.</p>
      <br>
      <button class="material-form-button" style="width: auto; margin: 0;" @click="addPeriod">Click here to add a period</button>
      <br>
      Your periods:
      <div v-for="(period, i) in periods" style="margin-left: 10px; margin-top: 6px;">
        <span style="padding: 4px 8px; background: #ddd; border-radius: 4px; display: inline-block;">{{ period }}</span>
        <span style="display: inline-block; margin-left: 10px; color: red; cursor: pointer;" @click="remove(i)">X</span>
      </div>
      <br><br><br>
      <h1>Add your <span style="text-decoration: underline; font-weight: bold;">first</span> schedule</h1>
      <p>After this setup, you can add as many schedules as your school needs/wants using YAML, but we will <strong>walk you through the first schedule.</strong></p><br>
      <p>A "schedule" as defined <strong>in this specific context</strong> is one day's worth of classes/periods. The same schedule can appear on <strong>many different days</strong> and even consecutively, but you define these schedules <strong>without any reference to the days</strong> when they will be used. That information will be needed and added later.</p><br>
      <p>In other words, you might add an "Assembly Schedule" and define the times for each of the periods that occur on that day. However, you, at this point, will not specifiy which days Assembly Schedule will occur.</p><br>
      <p><strong>Schedules have both a <i>name</i> and an <i>id</i>.</strong> The <i>id</i> is all lowercase, without spaces and is used to refer to the schedule from other parts of app. The <i>name</i> is displayed to the user. <strong>For example,</strong> the <i>name</i> for an assembly schedule would be "Assembly Schedule" because that is what we want the user to see. However, the <i>id</i> could be "assembly-schedule" or "assembly" or "assem-schedule" or something similar.</p><br>
      <button v-if="!schedule.id && !schedule.name" class="material-form-button" style="width: auto; margin: 0;" @click="createFirstSchedule">Click here to create your first day schedule</button><br>
      <div v-if="schedule.id && schedule.name">
        <button class="material-form-button" style="width: auto; margin: 0; background: blue; color: white;" @click="addEventToSchedule">Add an period to {{ schedule.name }}</button>
        <br>
        <p>This is what the equivalent YAML would look like (you will have to write code like this in a bit):</p>
        <textarea :value="generateSchedule(schedule.id, schedule.name, schedule.events)" style="background: #ddd; font-family: monospace; width: 40%; height: 150px; padding: 10px; border-radius: 4px; color: black; outline: none;" disabled="true"></textarea>
        <br><br>
        <p>Take note of the indentation above in the YAML. <strong>Indentation is extremely important</strong> and required in YAML. <strong>If indentation is not correct, your schedule will not work.</strong> Indent with <strong>2 spaces</strong> instead of a tab character.</p>
      </div>
      <br><br><br>
      <h1>Now you have most of the understanding needed to finish your schedule.</h1>
      <br><br>
      <button class="material-form-button">Let's continue</button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      periods: ['Period 0', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7'],
      schedule: {
        name: '',
        id: '',
        events: []
      }
    }
  },
  methods: {
    addPeriod() {
      let period = prompt('Type in a period name', 'Period 1');
      if (period) {
        this.periods.push(period.trim());
      }
    },
    remove(i) {
      this.periods.splice(i, 1);
    },
    createFirstSchedule() {
      let name = prompt('Enter the display name for this schedule. This is what users will see', 'Normal Schedule');

      if (!name) return;

      while (name.length > 30) {
        name = prompt('That display name is too long. Try a shorter name under 30 characters.', 'Normal Schedule');
        if (!name) return;
      }

      let id = prompt('Enter in the ID for this schedule. This is what will be used to refer to the schedule throughout the code. The id cannot have capitalizations or spaces. Use "-" instead os spaces.', 'normal-schedule');
      if (!id) return;

      while (id.includes(' ') || id.length > 30) {
        id = prompt('The id cannot contain spaces and must be under 30 characters.', 'normal-schedule');
        if (!id) return;
      }

      this.schedule.name = name.trim();
      this.schedule.id = id.trim().toLowerCase();
    },
    addEventToSchedule() {
      let period = prompt('What is the name of this period? Copy it *EXACTLY* as it you wrote it above under "Set up periods"', this.periods[0]);
      if (!period) return;

      while (!this.periods.includes(period)) {
        period = prompt(`"${period}" is not defined above in the "Set up periods" section. Either add ${period} above or try a different period.`);
        if (!period) return;
      }

      let time = prompt(`In 24 hour time, what time does ${period} START at?`);
      if (!time) return;
      let finish = prompt(`In 24 hour time, what time does ${period} END at?`);
      if (!finish) return;

      this.schedule.events.push(`${time} ${period}`);
      this.schedule.events.push(`${finish} Free`);

    },
    generateSchedule(id, name, events) {
      return `${id}:
  name: ${name}
  schedule:
${events.map(e => '    - ' + e).join('\n')}`;
    }
  }
}
</script>

<style scoped>
h1 {
  font-weight: bold;
}
strong {
  font-weight: bold;
  color: #ff0000;
}
</style>
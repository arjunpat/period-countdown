<template>
  <div style="padding: 20px;">
    <span class="title">Schedules</span>
    <div style="margin-top: 40px;">
      <div style="max-width: 800px; padding: 20px; margin: 0 auto; border: 4px solid red; border-radius: 8px;">
        <h2 style="font-weight: bold;">IMPORTANT!</h2><br>
        <h3>If your school's schedule isn't currently available on periods.io, you can <strong>create and maintain</strong> the schedule for your school. By using this, you agree:</h3><br>
        <p>1. Before any schedule is publicly listed on periods.io for any user  to select, you and your schedule will undergo a semi-rigorous <strong>approval process</strong> to ensure the current and expected validity of your schedule.</p><br>
        <p>2. Your <strong>contact information (your email and your first name)</strong> will be displayed publicly for users to file complaints regarding issues with the timings or names of your schedule. A <strong>hisory of all changes</strong> you make to schedules will also be publicly available under your email.</p><br>
        <p>3. If your schedule is approved, you will have <strong>full control and responsibility</strong> for the maintenance of the schedule. You will need to <strong>manually input</strong> your school's holidays, summer break, minimum days, assembly days, etc. throughout the school year.</p><br>
        <p>4. New schedules should be created for schools that do not already have a schedule on periods.io. Repeated schools will not be approved.</p><br>
        <p>5. Any abuse of this feature will result in <strong>account termination.</strong></p><br>
      </div>
      <div style="padding: 40px;">
        <h1>Your Schedules</h1>
        <span>You currently maintain {{ schedules.length }} schedule(s)</span>
        <br><br>
        <div style="display: flex; flex-wrap: wrap;">
          <div v-for="schedule in schedules" class="schedule">
            <span style="font-weight: bold; font-size: 28px; display: block;">{{ schedule.name }}</span>
            <span style="color: #666; font-size: 22px; display: block;">{{ schedule.id }}</span>
          </div>
          <div class="schedule" @click="$router.push({ path: 'new' })">
            <span style="font-weight: bold; font-size: 28px; display: block;">+ new schedule</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  
export default {
  data() {
    return {
      schedules: [
        {
          name: 'Mountain View High School',
          id: 'mvhs'
        }
      ]
    }
  }
}
</script>

<style scoped>
strong {
  font-weight: bold;
  color: #ff0000;
}

p {
  color: #222;
}

h1 {
  font-weight: bold;
}

.schedule {
  margin: 20px 30px 10px 0;
  min-height: 150px;
  width: 200px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all .2s ease;
  box-shadow: 1px 1px 10px 5px rgba(0, 0, 0, 0.14);
}

.schedule:hover {
  box-shadow: 1px 3px 14px 5px rgba(0, 0, 0, 0.2);
  transform: translateY(-3px);
}
</style>
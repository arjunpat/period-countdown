<template>
  <div style="padding: 20px;">
    <span class="title">New Schedule</span>
    <div style="margin-top: 40px;">
      <div style="width: 80%; padding: 0 40px;">
        <span style="font-size: 24px; color: #444;">this schedule is for:</span><br>
        <div class="material-input-group">
          <input
            maxlength="500"
            class="material-input"
            :class="{ 'has-value': !!schoolName }"
            v-model="schoolName"
            placeholder="Your school name"
            style="font-size: 50px; height: auto;"
          >
        </div>
        <span style="font-size: 24px; color: #444;">{{schoolName || 'the school'}}'s ZIP Code is:</span><br><br>
        <div class="material-input-group" style="display: inline-block; margin-right: 30px; width: 250px; margin-bottom: 0;">
          <input
            maxlength="80"
            type="number"
            class="material-input"
            :class="{ 'has-value': !!zipCode }"
            v-model="zipCode"
            placeholder="ZIP Code"
          >
        </div>
        <br><br>
        <span style="color: red;" v-show="zipCode && (zipCode.length !== 5 || parseInt(zipCode) < 1 || parseInt(zipCode) > 100000)">Not a valid ZIP Code</span>
        <br><br>
        <span style="font-size: 24px; color: #444;">re-enter ZIP Code:</span><br><br>
        <div class="material-input-group" style="display: inline-block; margin-right: 30px; width: 250px; margin-bottom: 0;">
          <input
            maxlength="80"
            type="number"
            class="material-input"
            :class="{ 'has-value': !!zipCodeAgain }"
            v-model="zipCodeAgain"
            placeholder="ZIP Code"
          >
        </div>
        <br><br>
        <span style="color: red;" v-show="zipCodeAgain && zipCodeAgain !== zipCode">ZIP Codes don't match</span>
        <br><br>
        <span style="font-size: 24px; color: #444;">school website:</span><br><br>
        <div class="material-input-group" style="display: inline-block; margin-right: 30px; width: 250px; margin-bottom: 0;">
          <input
            class="material-input"
            :class="{ 'has-value': !!website }"
            v-model="website"
            placeholder="school URL here"
          >
        </div>
        <br><br><br><br>
        <span style="font-size: 24px; color: #444;">your relation to {{ schoolName || 'this school' }}:</span><br><br>
        <div class="material-input-group" style="display: inline-block; margin-right: 30px; width: 250px; margin-bottom: 0;">
          <input
            class="material-input"
            :class="{ 'has-value': !!relation }"
            v-model="relation"
            placeholder="student, teacher, administrator, etc."
          >
        </div>
      </div>
      <button
        class="material-form-button"
        style="margin: 40px 0 0 40px; font-size: 32px; height: auto; width: auto; padding: 10px 36px; border-radius: 10px;"
        v-show="zipCode.length === 5 && zipCode === zipCodeAgain && website && relation"
        @click="$router.push({ path: '/schedules/setup/mvhs' })"
      >Create</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      schoolName: '',
      zipCode: '',
      zipCodeAgain: '',
      website: '',
      relation: ''
    }
  }
}
</script>

<style scoped>
select {
  display: block;
  background: #eaeaea;
  color: #000;
  border: none;
  border-radius: 0;
  padding: 2px 15px 2px 10px;
  cursor: pointer;
  margin: 0;
  width: 250px;
  height: 30px;
  font-size: 20px;
  outline: 0;
}
</style>
import { logger } from './init.js';

export default class ScheduleBuilder {
  constructor() {}

  init(school, schedule) {
    this.school = JSON.stringify(school);
    this.periods = school.periods;
    this.schedule = JSON.stringify(schedule);
    this.initialized = true;
  }

  generatePresets() {
    if (!this.isInitialized())
      throw 'has not been initialized';

    let freePeriodsExist = (!this.free || Object.keys(this.free).length === 0) ? false : true;

    logger.time('ScheduleBuilder', 'parse-time');
    let presets = JSON.parse(this.school).presets;

    for (let key in presets) {
      if (!presets.hasOwnProperty(key) || !freePeriodsExist)
        continue;

      let schedule = presets[key].s;

      // removes free periods at the beginning of the day
      while (schedule.length > 0) {
        if (!this.isPeriod(schedule[0].n) || this.free[schedule[0].n]) {
          schedule.splice(0, 1);
        } else {
          break;
        }
      }

      // remove periods at the end of the day
      let freeEvent;
      while (schedule.length > 1) {
        let i = schedule.length - 2;
        if (this.isPeriod(schedule[i].n)) {
          if (this.free[schedule[i].n]) {
            freeEvent = schedule[i];
            schedule.splice(i, 1);
          } else {
            if (freeEvent) {
              schedule[schedule.length - 1].f = freeEvent.f;
            }
            break;
          }
        } else {
          freeEvent = schedule[i];
          schedule.splice(i, 1);
        }
      }

    }

    logger.timeEnd('ScheduleBuilder', 'parse-time');

    this.new = false;
    return presets;
  }

  buildAll() {
    return {
      presets: this.generatePresets(),
      ...JSON.parse(this.schedule)
    }
  }

  setFreePeriods(obj) {
    let firstRun = !this.free;

    if (firstRun) {
      this.free = {};
    }

    for (let key in obj)
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'boolean' && this.free[key] !== obj[key]) {
        this.free[key] = obj[key];
        this.new = true;
      }

    if (firstRun && !Object.keys(this.free).find(key => this.free[key] === true))
      this.new = false;

    // make sure not all periods are free
    if (!Object.keys(this.free).find(key => this.free[key] === false))
      delete this.free; // just treats it like a normal schedule
  }

  isPeriod(name) {

    // TODO optimize and figure out where to put
    return this.periods.some(a => a === name);
  }

  isNew() { return !!this.new && this.isInitialized(); }

  isInitialized() { return !!this.initialized; }
}

import Analytics from './Analytics.js';
import Logger from './Logger.js';
import PrefManager from './PrefManager.js';
import RequestManager from './RequestManager.js';
import TimingEngine from './TimingEngine.js';
import TimingManager from './TimingManager.js';
import ScheduleBuilder from './ScheduleBuilder.js';

export const logger = new Logger();
export const timingManager = new TimingManager();
export const timingEngine = new TimingEngine();
export const analytics = new Analytics();
export const prefManager = new PrefManager();
export const scheduleBuilder = new ScheduleBuilder();

timingManager.setTimerPrepareMethod((school, schedule) => {
  scheduleBuilder.setFreePeriods(prefManager.getAllPreferences().freePeriods || {});
	scheduleBuilder.init(school, schedule);
	
	let { presets, calendar, defaults } = scheduleBuilder.buildAll();

	timingEngine.init(presets, calendar, defaults);
});

setTimeout(() => {
  if (!analytics.hasSent()) {
    RequestManager.sendError({
      error: 'analytics_not_sent',
      data: analytics.data
    });
  }
}, 20000);
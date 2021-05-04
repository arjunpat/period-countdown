import Analytics from './Analytics.js';
import Logger from './Logger.js';
import RequestManager from './RequestManager.js';
import TimingEngine from './TimingEngine.js';
import TimingManager from './TimingManager.js';
import ScheduleBuilder from './ScheduleBuilder.js';

export const logger = new Logger();
export const timingManager = new TimingManager();
export const timingEngine = new TimingEngine();
export const analytics = new Analytics();
export const scheduleBuilder = new ScheduleBuilder();

setTimeout(() => {
  if (!analytics.hasSent()) {
    RequestManager.sendError({
      error: 'analytics_not_sent',
      data: analytics.data
    });
  }
}, 20000);
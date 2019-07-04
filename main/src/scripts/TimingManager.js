import RequestManager from './RequestManager';
import { logger } from './init';

export default class TimingManager {
	constructor() {
		this.state = {
			newSchool: false,
			loopHasStarted: false,
			schoolData: {}
		}
	}

	async setSchoolId(id) {
		if (this.state.schoolId !== id) {
			this.state.schoolId = id;
			this.state.newSchool = true;
		}
	}

	init(schoolId) {
		this.state.schoolId = schoolId;
	}

	async loadSchool(id) {
		if (!this.state.schoolData[id]) {
			let [ school, schedule ] = await Promise.all([RequestManager.getSchoolMeta(id), RequestManager.getSchoolSchedule(id)]);
			this.state.schoolData[id] = {
				school,
				schedule
			}
		}
	}

	startLoop() {
		if (this.state.loopHasStarted) {
			return;
		}

		this.loop(true);

		this.state.loopHasStarted = true;
	}

	stopLoop() {
		if (typeof this.state.timeoutId !== 'undefined') {
			window.clearTimeout(this.state.timeoutId);
			this.state.loopHasStarted = false;
		}
	}

	async initTimer() {
		let { schoolId } = this.state;

		await this.loadSchool(schoolId);

		logger.time('TimingManager', 'full timer init');

		this.timerPrepareMethod(this.state.schoolData[schoolId].school, this.state.schoolData[schoolId].schedule);

		this.stopLoop();
		this.state.newSchool = false;
		this.startLoop();

		logger.timeEnd('TimingManager', 'full timer init');
	}

	setTimerPrepareMethod(func) {
		this.timerPrepareMethod = func;
	}

	setLoop(func) {
		this.loop = func;
	}

	repeatLoopIn(ms) {
		this.state.timeoutId = window.setTimeout(this.loop, ms);
	}

	getSchoolData(schoolId) {
		return this.state.schoolData[schoolId];
	}

	getSchoolId() {
		return this.state.schoolId;
	}

	isNewSchool() {
		return this.state.newSchool;
	}

	hasLoopStarted() {
		return this.state.loopHasStarted;
	}
}

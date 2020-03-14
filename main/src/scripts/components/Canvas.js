
export default class Canvas {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.props = {
			colors: {
				completed: '#fff'
			},
			decimalCompleted: 0,
			decimalAnimatingTowards: 0
		}
		this.animationInterval; // this is a thing

		this.dimension();
	}

	draw(to) {
		let w = window.innerWidth,
			h = window.innerHeight;

		this.ctx.clearRect(0, 0, w, h);

		this.ctx.fillStyle = this.props.colors.completed;
		this.ctx.fillRect(0, 0, to * w, h);

		this.props.decimalCompleted = to;
	}

	animate(to, length) {

		if (to === this.props.decimalAnimatingTowards) return;

		this.props.decimalAnimatingTowards = to;
		window.cancelAnimationFrame(this.animationInterval); // just for fun!
		delete this.animationInterval;

		let reg = this.createSineRegression(this.props.decimalCompleted, to, length);

		let startTime = window.performance.now();

		let func = () => {
			let secondsPassed = (window.performance.now() - startTime) / 1e3;

			this.draw(reg(secondsPassed));

			if (length < secondsPassed) {
				window.cancelAnimationFrame(this.animationInterval);
				delete this.animationInterval;
				this.draw(this.props.decimalAnimatingTowards);
				return;
			}

			window.requestAnimationFrame(func);
		}

		this.animationInterval = window.requestAnimationFrame(func);

	}

	createSineRegression(from, to, length) {
		let amp = (to - from) / 2,
			verticalShift = (from + to) / 2,
			b = (2 * Math.PI) / (2 * length);

		return x => (amp * (Math.sin(b * (x - (length / 2))))) + verticalShift;
	}

	redraw() { this.draw(this.props.decimalCompleted); }

	updateColors(background, completed) {

		if (typeof background === 'object') {
			let str = 'linear-gradient(90deg';
			for (let i = 0 ; i < background.stops.length; i++) {
				str += ', ' + background.stops[i];
			}
			str += ')';

			this.canvas.style.background = str;
		} else {
			this.canvas.style.background = background;
		}

		this.props.colors.completed = completed;
		this.redraw();
	}

	dimension() {
		let dpr = window.devicePixelRatio || 1;
		this.canvas.style.width = window.innerWidth + 'px';
		this.canvas.style.height = window.innerHeight + 'px';
		this.canvas.width = window.innerWidth * dpr;
		this.canvas.height = window.innerHeight * dpr;
		this.ctx.scale(dpr, dpr);

		this.redraw();
	}
}
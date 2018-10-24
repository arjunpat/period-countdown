'use strict';

export default class Canvas {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.props = {
			colors: {
				background: '#000',
				completed: '#fff'
			},
			decimalCompleted: 0,
			decimalAnimatingTowards: 0
		}
		this.animationInterval; // j to remind myself this is a thing

		this.dimension();
	}

	draw(to) {
		let w = this.canvas.width,
			h = this.canvas.height;

		this.ctx.fillStyle = this.props.colors.background;
		this.ctx.fillRect(0, 0, w, h);

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
			verticleShift = (from + to) / 2,
			b = (2 * Math.PI) / (2 * length);

		return x => (amp * (Math.sin(b * (x - (length / 2))))) + verticleShift;
	}

	redraw() { this.draw(this.props.decimalCompleted); }

	updateColors(background, completed) {

		if (typeof background === 'object') {
			/*
				{
					type: 'linear_gradient',
					stops: ['#fccb0b','#fc590b']
				}
			*/

			this.props.colors.background = this.parseGradient(background);
			this.props.colors.gradient = background;
		} else {
			this.props.colors.background = background;
			this.props.colors.gradient = undefined;
		}

		this.props.colors.completed = completed;
		this.redraw();
	}

	dimension() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		if (this.props.colors.gradient)
			this.props.colors.background = this.parseGradient(this.props.colors.gradient);

		this.redraw();
	}

	parseGradient(obj) {
		let grd = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
		for (let i = 0; i < obj.stops.length; i++)
			grd.addColorStop(i / (obj.stops.length - 1), obj.stops[i]);
		
		return grd;
	}

}
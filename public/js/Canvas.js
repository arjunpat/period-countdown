'use strict';

class Canvas {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.props = {
			colors: {
				background: '#000',
				completed: '#fff'
			},
			decimalCompleted: 0,
			animationLength: 2,
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

	animate(to) {

		if (to === this.props.decimalAnimatingTowards) return;

		this.props.decimalAnimatingTowards = to;
		window.cancelAnimationFrame(this.animationInterval); // just for fun!
		delete this.animationInterval;

		let reg = this.createSineAnimationRegression(this.props.decimalCompleted, to);

		let startTime = Date.now();

		let func = () => {
			let secondsPassed = (Date.now() - startTime) / 1e3;

			this.draw(reg(secondsPassed));

			if (this.props.animationLength < secondsPassed) {
				window.cancelAnimationFrame(this.animationInterval);
				delete this.animationInterval;
				this.draw(this.props.decimalAnimatingTowards);
				return;
			}

			window.requestAnimationFrame(func);
		}

		this.animationInterval = window.requestAnimationFrame(func);


	}

	createSineAnimationRegression(from, to) {
		let amp = (to - from) / 2,
			verticleShift = (from + to) / 2,
			b = (2 * Math.PI) / (2 * this.props.animationLength);

		return x => (amp * (Math.sin(b * (x - (this.props.animationLength / 2))))) + verticleShift;
	}

	redraw() { this.draw(this.props.decimalCompleted); }

	updateColors(background, completed) {
		this.props.colors.background = background;
		this.props.colors.completed = completed;
		this.redraw();
	}

	dimension() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.redraw();
	}

}

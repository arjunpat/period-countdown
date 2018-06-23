'use strict';

class Canvas {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.props = {
			colors: {
				background: '#fccb0b',
				completed: '#fee581'
			},
			decimalCompleted: 0,
			animationLength: 2
		}
		this.animationInterval;

		this.dimension(); // will also draw
	}

	draw(to) {
		let w = this.canvas.width, h = this.canvas.height;

		/*this.ctx.clearRect(0, 0, w, h);*/

		this.ctx.fillStyle = this.props.colors.background;
		this.ctx.fillRect(0, 0, w, h);


		this.ctx.fillStyle = this.props.colors.completed;
		this.ctx.fillRect(0, 0, to * w, h);
		//this.ctx.stroke();

		this.props.decimalCompleted = to;
	}

	animate(to) {

		if (to !== this.props.decimalCompleted) {
			window.clearInterval(this.animationInterval); // just for fun!

			let reg = this.createSineAnimationRegression(this.props.decimalCompleted, to);

			let startTime = Date.now();

			this.animationInterval = setInterval(() => {
				let secondsPassed = (Date.now() - startTime) / 1e3;

				if (this.props.animationLength < secondsPassed) window.clearInterval(this.animationInterval);

				this.draw(reg(secondsPassed));

			}, 10);

		}

	}

	createSineAnimationRegression(from, to) {
		let amp = (to - from) / 2,
			verticleShift = (from + to) / 2,
			b = (2 * Math.PI) / (2 * this.props.animationLength);

		return x => (amp * (Math.sin(b * (x - (this.props.animationLength / 2))))) + verticleShift;
	}

	redraw() {
		this.draw(this.props.decimalCompleted);
	}

	updateColors(background, completed) {
		this.props.colors.background = background;
		this.props.colors.completed = completed;
		this.redraw();
	}

	dimension(shouldRedraw) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.redraw();
	}

}
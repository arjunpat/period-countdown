<template>
  <canvas ref="canvas" :style="{ background: backgroundColor }"></canvas>
</template>

<script>
export default {
  props: {
    backgroundColor: String,
    completedColor: String,
    percentCompleted: Number,
    innerWidth: Number
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      decimalCompleted: 0,
      decimalAnimatingTowards: 0,
      animationInterval: null,
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.dimension();
  },
  watch: {
    percentCompleted() {
      if (
				(this.percentCompleted < 1 && this.decimalCompleted <= .1 && !this.animationInterval)
				|| (this.percentCompleted > 99 && this.decimalCompleted >= .99)
			) {
				this.draw(this.percentCompleted / 100); // more specific at the beginning or end
			} else if (!this.animationInterval) {
				this.animate(Math.floor(this.percentCompleted) / 100, 2);
			}
    },
    completedColor() {
      this.redraw();
    },
    innerWidth() {
      this.dimension();
    }
  },
  methods: {
    dimension() {
      let dpr = window.devicePixelRatio || 1;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.ctx.scale(dpr, dpr);

      this.redraw();
    },
    redraw() {
      this.draw(this.decimalCompleted);
    },
    draw(to) {
      let w = window.innerWidth,
        h = window.innerHeight;

      this.ctx.clearRect(0, 0, w, h);

      this.ctx.fillStyle = this.completedColor;
      this.ctx.fillRect(0, 0, to * w, h);

      this.decimalCompleted = to;
    },
    createSineRegression(from, to, length) {
      let amp = (to - from) / 2,
        verticalShift = (from + to) / 2,
        b = (2 * Math.PI) / (2 * length);

		  return x => (amp * (Math.sin(b * (x - (length / 2))))) + verticalShift;
    },
    animate(to, length) {
      if (to === this.decimalAnimatingTowards) return;

      this.decimalAnimatingTowards = to;
      window.cancelAnimationFrame(this.animationInterval); // just for fun!
      delete this.animationInterval;

      let reg = this.createSineRegression(this.decimalCompleted, to, length);

      let startTime = window.performance.now();

      let func = () => {
        let secondsPassed = (window.performance.now() - startTime) / 1e3;

        this.draw(reg(secondsPassed));

        if (length < secondsPassed) {
          window.cancelAnimationFrame(this.animationInterval);
          delete this.animationInterval;
          this.draw(this.decimalAnimatingTowards);
          return;
        }

        window.requestAnimationFrame(func);
      }

      this.animationInterval = window.requestAnimationFrame(func);
    }
  },
}
</script>
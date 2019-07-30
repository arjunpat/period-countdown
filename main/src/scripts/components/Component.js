
// basically react but less features, less code, and no libraries

export default class Component {

	constructor(element) {
		this.element = element;
		this.state = {};
	}

	render() {
		return '<div></div>';
	}

	_paint(html) {
		this.element.innerHTML = html;
		this.lastHTML = html;
	}

	draw() {
		// TODO make this just change necessary parts. lit-html?

		let html = this.render();
		if (this.lastHTML !== html) {
			this._paint(html);
		}
	}

	setState(obj) {
		for (let key in obj) {
			if (!this.state[key] || this.state[key] !== obj[key]) {
				this.state[key] = obj[key];
			}
		}

		this.draw();
	}

	getElement() { return this.element; }

}

export function escapeHTML(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
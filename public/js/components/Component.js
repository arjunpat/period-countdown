
// basically react but less features, less code, and no libraries

export default class Component {

	constructor(element) {
		this.element = element;
		this.props = {};
	}

	render() {
		return '<div></div>';
	}

	_paint(html) {
		this.element.innerHTML = html;
		this.lastHTML = html;
	}

	draw() {
		let html = this.render();
		this._paint(html);
	}

	redraw() {
		// TODO make this just change necessary parts. lit-html?

		let html = this.render();
		if (this.lastHTML !== html) {
			this._paint(html);
		}
	}

	setProp(key, value) {
		if (!this.props[key] || this.props[key] !== value) {
			this.props[key] = value;
			this.draw();
		}
	}

	getElement() { return this.element; }

}

export function escapeHTML(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
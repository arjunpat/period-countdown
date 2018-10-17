import Component, { escapeHTML } from './Component';

export default class SchoolSelector extends Component {
	
	constructor(element, schoolOptions) {
		super(element);
		this.draw();
	}

	render() {
		let html = '';
		if (this.props.schoolOptions) {
			let s = this.props.schoolOptions;

			for (let i = 0; i < s.length; i++) {
				html += `<option value="${ escapeHTML(s[i][0]) }">${ escapeHTML(s[i][1]) }</option>`;
			}
		}

		return html;
	}

	getSelection() {
		return this.getElement().value;
	}

	setSelection(id) {
		this.getElement().value = id;
	}

	setSchoolOptions(arr) {
		this.props.schoolOptions = arr;
		this.redraw();
	}

}
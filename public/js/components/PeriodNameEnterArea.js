import Component, { escapeHTML } from './Component';
import { isFreePeriod } from '../extras';

export default class PeriodNameEnterArea extends Component {
	constructor(element) {
		super(element);
		this.props.disabled = true;
		this.props.periodNamePrefs = {};

		this.draw();
	}

	render() {
		let html = '';

		if (this.props.periods) {
			let firstCol = Math.ceil(this.props.periods.length / 2);

			html += '<div style="flex: 1; padding: 0 1.5%;">';
			for (let i = 0; i < firstCol; i++) {
				html += this._generatePeriodInputHTML(i);
			}

			html += '</div><div style="flex: 1; padding: 0 1.5%;">';

			for (let i = firstCol; i < this.props.periods.length ; i++) {
				html += this._generatePeriodInputHTML(i);
			}

			html += '</div>';

		} else {
			return '<span style="font-size: 20px;">Loading...</span>';
		}

		return html;
	}

	_generatePeriodInputHTML(i) {
		let period = this.props.periods[i];
		let value = this.props.periodNamePrefs[period] || '';
		let isFree = isFreePeriod(value);
		let id = this._encodePeriodNameId(this.props.periods[i]);
		let dis = this.props.disabled;

		return `
			<div class="material-input-group">
				<input ${dis ? 'disabled' : ''} type="text" id="${ id }" maxlength="20" autocomplete="off"
					class="material-form-control${value ? ' has-value' : ''}"
					style="border-bottom-style: ${dis ? 'dotted' : 'solid'}; border-color: ${dis ? '#a0a0a0' : ''}"
					value="${ escapeHTML(value) }"
				>
				<label for="${ id }">
					${ this.props.periods[i] }${isFree ? ' - removed from schedule' : ''}
				</label>
			</div>
		`;
	}

	_encodePeriodNameId(name) {
		return 'period-input-field-' + name.replace(/\s/g, '_');
	}

	_decodePeriodNameId(id) {
		return id.replace('period-input-field-', '').replace(/_/g, ' ');
	}

	setDisabled(bool) {
		this.props.disabled = bool;
		this.redraw();
	}

	setPeriods(periods) {
		this.props.periods = periods;
		this.redraw();

		for (let ele of this.getElement().querySelectorAll('input')) {

			ele.onblur = () => {
				ele.onkeyup();
			}

			ele.onkeyup = () => {
				let value = ele.value;

				if (value.length > 0) {
					ele.classList.add('has-value');
				} else {
					ele.classList.remove('has-value');
				}

				let label = ele.parentNode.querySelector('label');
				if (isFreePeriod(value)) {
					if (!label.innerHTML.includes(' - removed from schedule')) {
						label.innerHTML += ' - removed from schedule';
					}
				} else {
					label.innerHTML = label.innerHTML.replace(' - removed from schedule', '');
				}
			}

		}
	}

	getPeriodNames() {
		let map = {};

		for (let input of this.getElement().querySelectorAll('input')) {
			map[ this._decodePeriodNameId(input.id) ] = input.value;
		}

		return map;
	}

	setPreferences(periodNamePrefs) {
		this.props.periodNamePrefs = periodNamePrefs;
		this.redraw();
	}
}

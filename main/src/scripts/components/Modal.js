import Component from './Component';

export default class Modal extends Component {
	constructor(element) {
		super(element);

		this.setState({
			title: '',
			body: ''
		});
	}

	render() {
		setTimeout(() => {
			document.querySelector('#modal-footer a').onclick = this.close.bind(this);
		}, 100);

		return `
			<div id="modal-title">
				<span class="show-notifications">${this.state.title}</span>
			</div>
			<div id="modal-body">
				${this.state.body}
			</div>
			<div id="modal-footer">
				<a>Close</a>
			</div>
		`;
	}

	close() {
		this.getElement().style.opacity = '0';
		setTimeout(() => {
			this.getElement().style.display = 'none';
			this.getElement().style.transform = 'translateY(-500px)';
			this.getElement().style.display = 'none';
		}, 400);
	}

	show(title, body) {
		this.setState({
			title,
			body
		});

		this.getElement().style.display = 'block';

		setTimeout(() => {
			this.getElement().style.opacity = '1';
			this.getElement().style.transform = 'translateY(0)';
		}, 20);
	}
}
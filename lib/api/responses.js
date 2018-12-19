module.exports = {
	success(data) {
		let res = {
			success: true
		}

		if (data) res.data = data;

		return res;
	},
	error(error) {
		return {
			success: false,
			error
		}
	},
	badRequest() {
		return {
			success: false,
			error: 'bad_request'
		}
	}
}
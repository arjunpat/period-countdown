function split(str, chars) {
	const arr = [''];
	for (let c of str) {
		if (chars.includes(c)) {
			arr.push(c);
			arr.push('');
		} else {
			arr[arr.length - 1] += c;
		}
	}

	return arr.filter(a => a.length > 0);
}

function seek(arr, pos, char) {
	for (let i = pos + 1; i < arr.length; i++) {
		if (arr[i] === char) {
			return i;
		}
	}

	return -1;
}

function combine(arr, from, to) {
	let value = '';
	for (let i = from; i <= to; i++) {
		value += arr[i];
	}
	return value;
}

function getArray(arr, blockSeperator, i) {
	let values = [];
	let value = '';

	while (!blockSeperator.includes(arr[i]) && i < arr.length) {
		if (arr[i] === '\n') {
			values.push(value);
			value = '';
		} else {
			value += arr[i];
		}
		i++;
	}
	values.push(value);
	i--;

	return [values.filter(a => a.length > 0), i];
}

function clean(text) {
	text = text.replace(/\/\/.*|\/\*[^]*\*\//g, ''); // comments
	text = text.replace(/  +/g, ' '); // 2+ spaces
}

module.exports = { split, seek, combine, getArray }
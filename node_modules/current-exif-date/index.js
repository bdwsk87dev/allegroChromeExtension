'use strict';

var format = require('exif-date').format;

module.exports = function currentExifDate() {
	var currentDate = new Date();

	return format(new Date(Date.UTC(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		currentDate.getDate(),
		currentDate.getHours(),
		currentDate.getMinutes(),
		currentDate.getSeconds()
	)));
};

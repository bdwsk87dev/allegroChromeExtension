# current-exif-date

[![npm version](https://img.shields.io/npm/v/current-exif-date.svg)](https://www.npmjs.com/package/current-exif-date)
[![Build Status](https://travis-ci.com/shinnn/current-exif-date.svg?branch=master)](https://travis-ci.com/shinnn/current-exif-date)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/current-exif-date.svg)](https://coveralls.io/github/shinnn/current-exif-date?branch=master)

Get the current date as an Exif date format

```javascript
const currentExifDate = require('current-exif-date');

currentExifDate(); //=> '2018:06:15 10:13:05'
```

According to the [Exif specification (PDF)](http://www.cipa.jp/std/documents/e/DC-008-Translation-2016-E.pdf), the format of `DateTime`, `DateTimeOriginal` and `DateTimeDigitaized` is:

> "YYYY:MM:DD HH:MM:SS" with time shown in 24-hour
format, and the date and time separated by one blank character

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install current-exif-date
```

## API

```javascript
const currentExifDate = require('current-exif-date');
```

### currentExifDate()

Return: `string`

Note that the resultant date indicates the *local* time.

```javascript
// In Japan

new Date().toString(); //=> 'Fri Jun 15 2018 01:04:30 GMT+0900 (JST)'
new Date().toUTCString(); //=> 'Thu, 14 Jun 2018 16:04:30 GMT'

currentExifDate(); //=> '2018:06:15 01:04:30', not '2018:06:14 01:04:30 16:04:30'
```

## License

[ISC License](./LICENSE) © 2018 Shinnosuke Watanabe

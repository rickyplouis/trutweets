/* global test expect */
const moment = require('moment');
const Time = require('../controllers/time');

const {
  add24Hours,
  getProgress,
  assignProgress,
} = Time;

test('add24Hours_noParams_string', () => {
  expect(typeof add24Hours()).toBe('string');
});

test('add24Hours_stringParam_string', () => {
  const startDate = '2010-2-14'; // February 14th
  const endDate = 'Monday, February 15th 2010, 12:00:00 am';
  expect(add24Hours(startDate)).toMatch(endDate);
});

test('getProgress_noParams_100', () => {
  expect(getProgress()).toEqual(100);
});

test('getProgress_normalParams_50', () => {
  const fiveSeconds_before_now = moment(new Date()).subtract(5, 'seconds').toDate();
  const fiveSeconds_from_now = moment(new Date()).add(5, 'seconds').toDate();
  expect(Math.round(getProgress(fiveSeconds_before_now, fiveSeconds_from_now))).toEqual(50);
});

test('assignProgress_noParams_emptyArray', () => {
  expect(assignProgress()).toEqual([]);
});

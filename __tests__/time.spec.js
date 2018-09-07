/* global test expect */
const Time = require('../controllers/time');
const moment = require('moment');

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

test('add24Hours_arrayParam_string', () => {
  const startDate = [2010, 1, 14, 15, 25, 50, 125]; // February 14th, 3:25:50.125 PM
  const endDate = 'Monday, February 15th 2010, 3:25:50 pm';
  expect(add24Hours(startDate)).toMatch(endDate);
});

test('getProgress_noParams_emptyObject', () => {
  expect(getProgress()).toEqual(100);
});

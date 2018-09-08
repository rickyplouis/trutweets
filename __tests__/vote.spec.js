/* global test expect */
const moment = require('moment');
const Vote = require('../controllers/vote');

const {
  renderIcon,
  getPoints,
  getStreak,
  handleVote,
} = Vote;

const addSecondsFromNow = (date, seconds) => moment(date).add(seconds, 'seconds').toDate();

test('renderIcon_noParams_dislike-o', () => {
  expect(renderIcon()).toEqual('dislike-o');
});

test('renderIcon_normalParams_like', () => {
  const selectedAnnotation = {
    upvotes: ['userID'],
    downvotes: [],
  };

  expect(renderIcon(selectedAnnotation, 'userID', true)).toEqual('like');
});

test('getPoints_noParams_0', () => {
  expect(getPoints()).toBe(0);
});

test('getPoints_smallParam_2', () => {
  expect(getPoints(1)).toBe(10);
});

test('getPoints_largeParam_2', () => {
  expect(getPoints(200)).toBe(10);
});

test('getStreak_noParams_0', () => {
  expect(getStreak()).toBe(0);
});

test('getStreak_normalStreak_2', () => {
  const user = 'userID';
  const tweets = [
    {
      timeStart: new Date(),
      timeEnd: addSecondsFromNow(new Date(), 10),
      upvotes: ['userID'],
      downvotes: [],
    },
    {
      timeStart: new Date(),
      timeEnd: addSecondsFromNow(new Date(), 15),
      upvotes: ['anotherUser'],
      downvotes: [],
    },
    {
      timeStart: new Date(),
      timeEnd: addSecondsFromNow(new Date(), 20),
      upvotes: ['thirdUser'],
      downvotes: ['userID', 'anotherUser'],
    },
  ];
  expect(getStreak(user, tweets)).toBe(2);
});

test('handleVote_noParams_emptyObject', () => {
  expect(handleVote()).toEqual({});
});

test('handleVote_noParams_emptyObject', () => {
  expect(handleVote()).toEqual({});
});

test('handleVote_normalParams_object', () => {
  expect(handleVote(true, true, { upvotes: [], downvotes: [] }, 'userID'))
    .toEqual({ upvotes: ['userID'], downvotes: [] });
});

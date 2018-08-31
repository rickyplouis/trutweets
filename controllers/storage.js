/* eslint-env browser */

const hasStorage = () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (exception) {
    return false;
  }
};

const getFromStorage = val => localStorage.getItem(val);

const getToken = () => getFromStorage('token');
const getUser = () => getFromStorage('_p_user');
const getSecret = () => getFromStorage('secret');

module.exports = {
  hasStorage,
  getToken,
  getUser,
  getSecret,
};

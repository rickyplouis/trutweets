/* global fetch */
const handleSuccess = res => res.json().then(val => val);
const handleError = res => res.json().then(val => val.description[0]);

const makeRequest = (reqType, endpoint, body, token = '') => new Promise((resolve, reject) => {
  const options = {
    method: reqType,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  fetch(endpoint, options).then((response) => {
    if (response.status === 200) {
      resolve(handleSuccess(response));
    } else {
      reject(handleError(response));
    }
  }).catch((error) => {
    reject(error);
  });
});

const getReq = (endpoint, token) => makeRequest('get', endpoint, false, token);
const postReq = (endpoint, body, token) => makeRequest('post', endpoint, body, token);
const putReq = (endpoint, body, token) => makeRequest('put', endpoint, body, token);
const deleteReq = (endpoint, body, token) => makeRequest('delete', endpoint, body, token);

module.exports = {
  getReq,
  postReq,
  putReq,
  deleteReq,
};

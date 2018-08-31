/* eslint no-restricted-globals: "off" */
/* eslint no-restricted-syntax: "off" */
module.exports = {
  handleRequest(res, err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
  },
  makeRegex(inputString = '') {
    return new RegExp(`^${inputString}`, 'i');
  },
  hasProps(obj) {
    for (const key in obj) {
      if (obj[key].length > 0 || obj[key] !== '') {
        return true;
      }
    }
    return false;
  },
  valueIsBoolean(val) {
    return val === 'true' || val === 'false';
  },
  handleParams(reqQuery) {
    return Object.keys(reqQuery).reduce((acc, key) => {
      if (this.valueIsBoolean(reqQuery[key]) && key === 'visible') {
        acc[key] = (reqQuery[key] === 'true');
        return acc;
      }
      acc[key] = isNaN(reqQuery[key]) ? this.makeRegex(reqQuery[key]) : parseFloat(reqQuery[key]);
      return acc;
    }, {});
  },
  searchByParams(schema, params, res) {
    return schema.find(params).exec((err, vals) => {
      this.handleRequest(res, err, vals);
    });
  },
  searchById(schema, id, res) {
    return schema.findById(id).exec((err, val) => {
      this.handleRequest(res, err, val);
    });
  },
};

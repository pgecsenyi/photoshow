module.exports = function () {

  var dal = require('../dal/dal.js');

  this.getDal = function () {
    return dal;
  };
};

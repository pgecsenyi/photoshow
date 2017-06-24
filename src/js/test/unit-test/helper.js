const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');

const scriptPath = path.join(__dirname, '..', '..');

global.before(function () {
  chai.should();
  chai.use(chaiAsPromised);
});

module.exports = {
  'joinPaths': path.join,
  'scriptPath': scriptPath
};

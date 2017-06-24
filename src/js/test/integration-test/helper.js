const Application = require('spectron').Application;
// const assert = require('assert');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

var electronPath = path.join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'electron');
if (process.platform === 'win32') {
  electronPath += '.cmd';
}
var appPath = path.join(__dirname, '..', '..', '..');

global.before(function () {
  chai.should();
  chai.use(chaiAsPromised);
});

module.exports.getApplication = function() {
  return new Application({
    path: electronPath,
    args: [ appPath ]
  });
};

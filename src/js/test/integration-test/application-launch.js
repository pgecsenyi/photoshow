var helper = require('./helper.js');

describe('Integration tests / Application launch', function () {
  this.timeout(10000);

  beforeEach(function () {
    this.app = helper.getApplication();
    return this.app.start();
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('Shows an initial window and opens a background window', function () {
    // return this.app.client.getWindowCount().then(function (count) {
    //   assert.equal(count, 2);
    // });
    return this.app.client.waitUntilWindowLoaded().getWindowCount().should.eventually.equal(2);
  });
});

var helper = require('./helper.js');
var entities = require(helper.joinPaths(helper.scriptPath, 'dal', 'entities.js'));

const pathDal = helper.joinPaths(helper.scriptPath, 'dal', 'dal.js');

describe('Unit tests / DAL', function () {

  it('Add audience', function () {
    var dal = require(pathDal);
    var newAudience = new entities.Audience('tester', 'Tester');

    var result = dal.addAudience(newAudience).then(() => {
      return dal.getAudiences();
    });

    return result.should.eventually.include(newAudience);
  });
});

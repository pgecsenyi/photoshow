const angularHelper = require('../util/angular-helper.js');
const entities = require('../dal/entities.js');
const textUtil = require('../util/text.js');

module.exports = function ($scope, dalService) {

  $scope.title = 'Add audience - PhotoShow';
  $scope.visibleButtons = { 'back': true };

  $scope.isAudienceIdEdited = false;

  $scope.areThereAnyWarnings = function () {
    return !angularHelper.checkForm(this.addAudienceForm);
  };

  $scope.onAudienceNameChange = function () {
    if (!this.isAudienceIdEdited && this.audienceName) {
      this.audienceId = textUtil.createIdentifier(this.audienceName.toLowerCase());
    }
  };

  $scope.submitForm = function (isValid) {
    if (!isValid) {
      return;
    }
    if (!textUtil.containsAsciiCharsOnly(this.audienceId)) {
      this.setError('The identifier can consist of ASCII characters only.');
      return;
    }
    var newAudience = new entities.Audience(this.audienceId, this.audienceName);
    newAudience.color = this.audienceColor;
    dalService.getDal().addAudience(newAudience)
      .then(() => dalService.getDal().save())
      .then(() => {
        this.changeView('/presentations');
        this.$apply();
      })
      .catch(err => {
        this.setError('Failed to save audience. ' + err);
        this.$apply();
      });
  };
};

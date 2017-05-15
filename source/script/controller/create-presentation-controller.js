const path = require('path');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

const angularHelper = require('../util/angular-helper.js');
const ioUtil = require('../util/io.js');
const textUtil = require('../util/text.js');

module.exports = function ($scope, dalService, runtimePreferencesService, presentationEditorService) {

  $scope.title = 'Create presentation - PhotoShow';
  $scope.visibleButtons = { 'back': true };

  $scope.isPresentationIdEdited = false;

  $scope.areThereAnyWarnings = function () {
    return !angularHelper.checkForm(this.createPresentationForm);
  };

  $scope.onBrowse = function () {
    var selectedDirectories = dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select image source'
    });
    if (typeof selectedDirectories !== 'undefined' && selectedDirectories.length > 0) {
      this.presentationPath = selectedDirectories[0].substring(runtimePreferencesService.getBasePath().length);
      validatePath();
    }
  };

  $scope.onPresentationTitleChange = function () {
    if (!this.isPresentationIdEdited) {
      this.presentationId = textUtil.createIdentifier(this.presentationTitle.toLowerCase());
    }
  };

  $scope.submitForm = function (isValid) {
    if (!isValid || !validatePath()) {
      return;
    }
    if (!textUtil.containsAsciiCharsOnly(this.presentationId)) {
      this.setError('The identifier can consist of ASCII characters only.');
      return;
    }
    ioUtil.checkIfDirectoryExists(getFullPresentationPath())
      .then(doesDirectoryExist => {
        if (!doesDirectoryExist) {
          throw 'The specified directory does not exist.';
        }
        return dalService.getDal().getPresentation(this.presentationId);
      })
      .then(storedPresentation => {
        if (storedPresentation != null) {
          throw 'Presentation with the given ID does already exist.';
        } else {
          return dalService.getDal().getAudience(this.presentationAudienceId);
        }
      })
      .then(storedAudience => {
        if (storedAudience == null) {
          throw 'Audience with the given ID does not exist.';
        } else {
          presentationEditorService.updatePresentation(
            this.presentationId,
            this.presentationTitle,
            this.presentationPath,
            this.presentationAudienceId,
            runtimePreferencesService.getBasePath());
        }
      })
      .then(() => {
        this.changeView('/edit-transformations');
        this.$apply();
      })
      .catch(err => {
        this.setError('Failed to create presentation. ' + err);
        this.$apply();
      });
  };

  function getFullPresentationPath() {
    return path.join(runtimePreferencesService.getBasePath(), $scope.presentationPath);
  }

  function initialize() {
    $scope.presentationBasePath = runtimePreferencesService.getBasePath();
    var presentation = presentationEditorService.getPresentation();
    if (presentation != null) {
      $scope.presentationAudienceId = presentation.audienceId;
      $scope.presentationId = presentation.id;
      $scope.presentationTitle = presentation.title;
      $scope.presentationPath = presentation.path;
    }
  }

  function validatePath() {
    var result = ioUtil.validatePath(getFullPresentationPath());
    if (!result.isValid) {
      $scope.setError('Please provide a valid path.');
    } else {
      $scope.clearError();
    }

    return $scope.error == null;
  }

  initialize();
};

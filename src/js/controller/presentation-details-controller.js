const path = require('path');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const util = require('util');

require('../util/extensions-global.js');
const io = require('../util/io.js');

module.exports = function ($scope, $routeParams, dalService, runtimePreferencesService) {

  $scope.title = 'Presentations - PhotoShow';
  $scope.visibleButtons = { 'back': true };

  $scope.presentation = {};
  $scope.previewPath = '';
  $scope.transformationSummary = [];

  $scope.areThereAnyTransformations = function () {
    return this.presentation.transformations && !this.presentation.transformations.isEmpty();
  };

  $scope.onDelete = function () {
    dalService.getDal().deletePresentation(this.presentation.id)
      .then(() => dalService.getDal().save())
      .then(() => this.changeView('/presentations'))
      .catch(err => {
        this.setError('Failed to delete presentation. ' + err);
        this.$apply();
      });
  };

  $scope.onGeneratePresentation = function () {
    var selectedDirectories = dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Choose output directory'
    });
    if (typeof selectedDirectories !== 'undefined' && selectedDirectories.length > 0) {
      if (io.checkIfPathsAreEqual(selectedDirectories[0], getFullPresentationPath())) {
        this.setError('Output directory cannot be the same as the presentation\'s path.');
      } else {
        runtimePreferencesService.setOutputDirectory(selectedDirectories[0]);
        this.changeView('/generate-presentation' + this.presentation.id);
      }
    }
  };

  function buildTransformationSummary() {
    var t = $scope.presentation.transformations;
    $scope.transformationSummary = [];
    if (t != null) {
      if (t.scale) {
        $scope.transformationSummary.push(util.format('Scale to %dx%d', t.scale.width, t.scale.height));
      }
      if (t.rotate) {
        $scope.transformationSummary.push(util.format('Rotate by %d degrees', t.rotate.degree));
      }
      if (t.clean) {
        $scope.transformationSummary.push('Clean metadata');
      }
    }
  }

  function getFullPresentationPath() {
    return path.join(runtimePreferencesService.getBasePath(), $scope.presentation.path);
  }

  function initialize() {
    dalService.getDal().getPresentation($routeParams.presentationId)
      .then(presentation => {
        $scope.presentation = presentation;
        $scope.title = $scope.presentation.title + ' - PhotoShow';
        if ($scope.presentation.images != null && $scope.presentation.images.length > 0) {
          $scope.previewPath = path.join(getFullPresentationPath(), $scope.presentation.images[0].name);
        }
        buildTransformationSummary();
        $scope.$apply();
        startChangingPreview();
      })
      .catch(err => {
        $scope.setError(err);
        $scope.$apply();
      });
  }

  function startChangingPreview() {
    var images = $scope.presentation.images;
    if (images == null || images.length <= 1) {
      return;
    }
    var index = 1;
    var changeInterval = setInterval(function () {
      if (index == 0) {
        clearInterval(changeInterval);
      }
      $scope.previewPath = path.join(getFullPresentationPath(), images[index].name);
      $scope.$apply();
      index++;
      if (index >= images.length) {
        index = 0;
      }
    }, 2500);
  }

  initialize();
};

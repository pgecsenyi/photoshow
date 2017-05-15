const foreground = require('electron-process').foreground;
const path = require('path');
const remote = require('electron').remote;

const argumentProcessor = require('../util/argument-processor.js');
const presentationGeneratorMediator = require('../util/presentation-generator-mediator.js');

let processedArguments = argumentProcessor(remote.process.argv);
let presentationGeneratorMediatorAccessor = null;
if (processedArguments.isMultiThreaded && !processedArguments.isInDebugMode) {
  presentationGeneratorMediatorAccessor = foreground.getModule(presentationGeneratorMediator);
} else {
  presentationGeneratorMediatorAccessor = presentationGeneratorMediator;
}

module.exports = function ($scope, $routeParams, dalService, runtimePreferencesService) {

  $scope.title = 'Generate presentation - PhotoShow';
  $scope.visibleButtons = { 'back': true };

  $scope.currentFile = null;
  $scope.presentation = {};
  $scope.progressPercentage = 0;

  var step = 0;

  function getFullPresentationPath() {
    return path.join(runtimePreferencesService.getBasePath(), $scope.presentation.path);
  }

  function initialize() {
    dalService.getDal().getPresentation($routeParams.presentationId)
      .then(presentation => {
        $scope.presentation = presentation;
        $scope.$apply();
        startGeneration();
      })
      .catch(err => {
        $scope.setError('Failed to get presentation. ' + err);
        $scope.$apply();
      });
  }

  function onEndImageProcessing() {
    var newProgressPercentage = $scope.progressPercentage + step;
    $scope.progressPercentage = Math.min(Math.ceil(newProgressPercentage), 100);
    $scope.$apply();
  }

  function onStartImageProcessing(name) {
    $scope.currentFile = name;
    $scope.$apply();
  }

  function startGeneration() {
    var imageCount = $scope.presentation.images.length;
    if (imageCount === 0) {
      return;
    }
    step = (1 / imageCount) * 100;

    presentationGeneratorMediatorAccessor.generatePresentation(
      getFullPresentationPath(), runtimePreferencesService.getOutputDirectory(),
      $scope.presentation.images, $scope.presentation.transformations,
      onStartImageProcessing, onEndImageProcessing
    )
      .then(() => {
        $scope.changeView('/presentations');
        $scope.$apply();
      })
      .catch(err => {
        $scope.setError('Failed to generate presentation. ' + err);
        $scope.$apply();
      });
  }

  initialize();
};

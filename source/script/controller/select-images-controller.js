const entities = require('../dal/entities.js');

module.exports = function ($scope, hotkeys, dalService, presentationEditorService) {

  $scope.title = 'Select images - PhotoShow';
  $scope.visibleButtons = {'back' : true, 'save': true, 'cancel': true};

  $scope.allImageCount = 0;
  $scope.currentImageNumber = 1;
  $scope.description = null;
  $scope.enabledTransformations = {};
  $scope.isCurrentImageSelected = false;
  $scope.selectedImageCount = 0;
  $scope.shownDialog = null;
  $scope.transformations = {};

  $scope.getRotateDegree = function () {
    if (this.enabledTransformations.rotate) {
      return this.transformations.rotate.degree;
    }
    return 0;
  };

  $scope.onAccept = function () {
    selectImage();
  };

  $scope.onAddDescription = function () {
    $scope.shownDialog = 'description';
  };

  $scope.onApplyDescription = function () {
    var d = this.description && this.description.trim();
    if (!d || d == '') {
      d = null;
    }
    presentationEditorService.setDescriptionForCurrentImage(d);
    this.shownDialog = null;
    refreshDisplayedInfo();
  };

  $scope.onApplyTransformation = function () {
    this.shownDialog = null;
    applyTransformations();
  };

  $scope.onCancel = function () {
    presentationEditorService.reset();
    this.resetHistory('/');
    this.changeView('/presentations');
  };

  $scope.onClearDescription = function () {
    presentationEditorService.setDescriptionForCurrentImage(null);
    this.shownDialog = null;
    refreshDisplayedInfo();
  };

  $scope.onClearTransformation = function (transformation) {
    this.enabledTransformations[transformation] = false;
    this.shownDialog = null;
    applyTransformations();
  };

  $scope.onNextImage = function () {
    displayNext();
  };

  $scope.onPreviousImage = function () {
    displayPrevious();
  };

  $scope.onReject = function () {
    deselectImage();
  };

  $scope.onQuickRotate = function () {
    this.enabledTransformations.rotate = true;
    if (!this.transformations.rotate) {
      this.transformations.rotate = { 'degree': 90 };
    } else {
      this.transformations.rotate.degree = parseInt(this.transformations.rotate.degree);
      this.transformations.rotate.degree += 90;
      if (this.transformations.rotate.degree > 270) {
        this.transformations.rotate.degree = 0;
      }
    }
    applyTransformations();
  };

  $scope.onClean = function () {
    if (this.enabledTransformations.clean) {
      this.enabledTransformations.clean = false;
    } else {
      this.enabledTransformations.clean = true;
      this.transformations.clean = {};
    }
    applyTransformations();
  };

  $scope.onRotate = function () {
    enableTransformation('rotate', { 'degree': 90 });
  };

  $scope.onScale = function () {
    enableTransformation('scale', { 'width': 800, 'height': 600 });
  };

  $scope.onSave = function () {
    dalService.getDal().addOrUpdatePresentation(presentationEditorService.getPresentation())
      .then(() => {
        return dalService.getDal().save();
      })
      .then(() => {
        presentationEditorService.reset();
        this.changeView('/presentations');
        this.$apply();
      })
      .catch(err => {
        this.setError('Failed to save presentation. ' + err);
        this.$apply();
      });
  };

  function applyTransformations() {
    var imageTransformations = new entities.Transformations();
    if ($scope.enabledTransformations.clean) {
      imageTransformations.clean = new entities.CleanTransformation();
    }
    if ($scope.enabledTransformations.rotate) {
      imageTransformations.rotate = new entities.RotateTransformation($scope.transformations.rotate.degree);
    }
    if ($scope.enabledTransformations.scale) {
      imageTransformations.scale = new entities.ScaleTransformation(
        $scope.transformations.scale.width,
        $scope.transformations.scale.height);
    }
    presentationEditorService.setTransformationsForCurrentImage(imageTransformations);
    refreshDisplayedInfo();
  }

  function clearTransformations() {
    $scope.enabledTransformations = {};
    $scope.shownDialog = null;
    $scope.transformations = [];
  }

  function defineKeyboardShortcuts() {
    hotkeys.bindTo($scope).add({
      combo: 'left',
      description: 'Go back to the previous image.',
      callback: function() {
        displayPrevious();
      }
    });
    hotkeys.bindTo($scope).add({
      combo: 'right',
      description: 'Jump to the next image without selecting the current one.',
      callback: function() {
        displayNext();
      }
    });
    hotkeys.bindTo($scope).add({
      combo: 'space',
      description: 'Selects or deselects the current image.',
      callback: function() {
        toggleSelection();
      }
    });
  }

  function displayNext() {
    var nextPath = presentationEditorService.getNextPath();
    if (nextPath != null) {
      $scope.currentImagePath = nextPath;
    }
    refreshDisplayedInfo();
  }

  function displayPrevious() {
    var previousPath = presentationEditorService.getPreviousPath();
    if (previousPath != null) {
      $scope.currentImagePath = previousPath;
    }
    refreshDisplayedInfo();
  }

  function enableTransformation(transformation, defaultValue) {
    $scope.enabledTransformations[transformation] = true;
    $scope.shownDialog = transformation;
    if (typeof $scope.transformations[transformation] === 'undefined') {
      $scope.transformations[transformation] = defaultValue;
    }
  }

  function initialize() {
    $scope.allImageCount = presentationEditorService.getAllFileCount();
    $scope.currentImagePath = presentationEditorService.getCurrentPath();
    refreshDisplayedInfo();
    defineKeyboardShortcuts();
  }

  function deselectImage() {
    presentationEditorService.removeCurrent();
    refreshDisplayedInfo();
  }

  function refreshDisplayedInfo() {
    clearTransformations();
    $scope.currentImageNumber = presentationEditorService.getCurrentIndex() + 1;
    $scope.description = presentationEditorService.getCurrentDescription();
    $scope.isCurrentImageSelected = presentationEditorService.isCurrentImageSelected();
    $scope.selectedImageCount = presentationEditorService.getSelectedImageCount();
    $scope.transformations = presentationEditorService.getTransformationsForCurrentImage() || {};
    setEnabledTransformations();
  }

  function selectImage() {
    presentationEditorService.addCurrent();
    refreshDisplayedInfo();
  }

  function setEnabledTransformations() {
    var storedTransformations = presentationEditorService.getTransformationsForCurrentImage();
    for (var transformation in storedTransformations) {
      if ($scope.transformations[transformation]) {
        $scope.enabledTransformations[transformation] = true;
      }
    }
  }

  function toggleSelection() {
    if (presentationEditorService.isCurrentImageSelected()) {
      deselectImage();
    } else {
      selectImage();
    }
  }

  initialize();
};

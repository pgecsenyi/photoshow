const entities = require('../dal/entities.js');

module.exports = function ($scope, presentationEditorService) {

  $scope.title = 'Transformations - PhotoShow';
  $scope.visibleButtons = { 'back': true };

  $scope.enabledTransformations = {};
  $scope.shownDialog = null;
  $scope.transformations = {};

  $scope.onApplyTransformation = function () {
    this.shownDialog = null;
    applyTransformations();
  };

  $scope.onClearTransformation = function (transformation) {
    this.enabledTransformations[transformation] = false;
    this.shownDialog = null;
  };

  $scope.onEditClean = function () {
    if (this.enabledTransformations.clean) {
      this.enabledTransformations.clean = false;
    } else {
      this.enabledTransformations.clean = true;
      this.transformations.clean = {};
    }
    applyTransformations();
  };

  $scope.onEditRotate = function () {
    enableTransformation('rotate', { 'degree': 90 });
  };

  $scope.onEditScale = function () {
    enableTransformation('scale', { 'width': 800, 'height': 600 });
  };

  $scope.onNext = function () {
    presentationEditorService.collectImages()
      .then(() => {
        this.changeView('/select-images');
        this.$apply();
      })
      .catch(err => {
        this.setError('Failed to create presentation. ' + err);
        this.$apply();
      });
  };

  function applyTransformations() {
    var presentationTransformations = new entities.Transformations();
    if ($scope.enabledTransformations.clean) {
      presentationTransformations.clean = new entities.CleanTransformation();
    }
    if ($scope.enabledTransformations.rotate) {
      presentationTransformations.rotate = new entities.RotateTransformation($scope.transformations.rotate.degree);
    }
    if ($scope.enabledTransformations.scale) {
      presentationTransformations.scale = new entities.ScaleTransformation(
        parseInt($scope.transformations.scale.width),
        parseInt($scope.transformations.scale.height));
    }
    presentationEditorService.setTransformations(presentationTransformations);
  }

  function enableTransformation(transformation, defaultValue) {
    $scope.enabledTransformations[transformation] = true;
    $scope.shownDialog = transformation;
    if ($scope.transformations[transformation] == null) {
      $scope.transformations[transformation] = defaultValue;
    }
  }

  function initialize() {
    var presentationTransformations = presentationEditorService.getPresentation().transformations;
    if (presentationTransformations != null) {
      if (presentationTransformations.clean != null) {
        $scope.enabledTransformations.clean = true;
        $scope.transformations.clean = {};
      } else {
        $scope.transformations.clean = null;
      }

      if (presentationTransformations.rotate != null) {
        $scope.enabledTransformations.rotate = true;
        $scope.transformations.rotate = { 'degree': presentationTransformations.rotate.degree };
      } else {
        $scope.transformations.rotate = null;
      }

      if (presentationTransformations.scale != null) {
        $scope.enabledTransformations.scale = true;
        $scope.transformations.scale = {
          'width': presentationTransformations.scale.width,
          'height': presentationTransformations.scale.height
        };
      } else {
        $scope.transformations.scale = null;
      }
    }
  }

  initialize();
};

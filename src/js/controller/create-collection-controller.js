const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

const ioUtil = require('../util/io.js');

module.exports = function ($scope, dalService, runtimePreferencesService) {

  $scope.title = 'Create collection - PhotoShow';
  $scope.visibleButtons = { 'back': true };

  $scope.onBrowse = function () {
    var selectedFile = dialog.showSaveDialog({
      defaultPath: $scope.collectionPath,
      filters: [{ name: 'eXtensible Markup Language', extensions: ['xml']}],
      title: 'Save collection'
    });
    if (typeof selectedFile !== 'undefined') {
      this.collectionPath = selectedFile;
      validatePath();
    }
  };

  $scope.onCreate = function () {
    if (!validatePath()) {
      return;
    }
    dalService.getDal().initialize(this.collectionPath, true)
      .then(() => dalService.getDal().save())
      .then(() => {
        runtimePreferencesService.setBasePath(this.basePath);
        this.changeView('/presentations');
        this.$apply();
      })
      .catch(err => {
        this.setError('Failed to create collection. ' + err);
        this.$apply();
      });
  };

  function validatePath() {
    var result = ioUtil.validatePath($scope.collectionPath);
    if (!result.isValid) {
      $scope.setError('Please provide a valid path.');
    } else {
      $scope.collectionPath = result.path;
      $scope.clearError();
      if (!$scope.basePath || $scope.basePath === '') {
        $scope.basePath = result.basePath;
      }
    }

    return $scope.error == null;
  }
};

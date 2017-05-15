const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

const ioUtil = require('../util/io.js');

module.exports = function ($scope, dalService, runtimePreferencesService) {

  $scope.title = 'Open collection - PhotoShow';
  $scope.visibleButtons = { 'back': true };

  $scope.onBrowse = function () {
    var selectedFiles = dialog.showOpenDialog({
      filters: [{ name: 'eXtensible Markup Language', extensions: ['xml']}],
      properties: ['openFile'],
      title: 'Open collection'
    });
    if (typeof selectedFiles !== 'undefined' && selectedFiles.length > 0) {
      this.collectionPath = selectedFiles[0];
      validatePath();
    }
  };

  $scope.onOpen = function () {
    if (!validatePath()) {
      return;
    }
    ioUtil.checkIfFileExists(this.collectionPath)
      .then(result => {
        if (!result) {
          throw('File does not exist.');
        }
        return dalService.getDal().initialize(this.collectionPath);
      })
      .then(() => {
        runtimePreferencesService.setBasePath(this.basePath);
        this.changeView('/presentations');
        this.$apply();
      })
      .catch(err => {
        this.setError('Failed to open collection. ' + err);
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

const remote = require('electron').remote;

module.exports = function ($scope) {

  var isMaximized = false;
  var window = remote.getCurrentWindow();

  $scope.onMaximize = function () {
    if (isMaximized) {
      window.unmaximize();
    } else {
      window.maximize();
    }
    isMaximized = !isMaximized;
  };

  $scope.onMinimize = function () {
    window.minimize();
  };

  $scope.onClose = function () {
    window.close();
  };
};

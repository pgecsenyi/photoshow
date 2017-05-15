module.exports = function ($scope, dalService, presentationEditorService) {

  $scope.title = 'Presentations - PhotoShow';
  $scope.visibleButtons = { 'addAudience': true, 'generate': true, 'home': true, 'createPresentation': true };

  $scope.audienceColors = {};
  $scope.nameFilter = '';
  $scope.presentations = [];

  $scope.onCreatePresentation = function () {
    presentationEditorService.reset();
    this.changeView('/create-presentation');
  };

  function initialize() {
    var audienceColors = {};
    dalService.getDal().getAudiences()
      .then(audiences => {
        for (let i = 0; i < audiences.length; i++) {
          audienceColors[audiences[i].id] = audiences[i].color;
        }
        $scope.audienceColors = audienceColors;
        return dalService.getDal().getPresentationHeaders();
      })
      .then(presentations => {
        $scope.presentations = presentations;
        $scope.$apply();
      })
      .catch(err => {
        $scope.setError('Failed to get the list of presentations. ' + err);
        $scope.$apply();
      });
  }

  initialize();
};

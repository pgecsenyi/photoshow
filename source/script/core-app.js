/**
 * Core App
 *
 * This file is required by the index.html file and will be executed in the renderer process for that window. All of the
 * Node.js APIs are available in this process.
 */

/*global angular */
var coreApp = angular.module('coreApp', ['ngRoute', 'ngLoadScript', 'cfp.hotkeys']);

// Modules.
var addAudienceController = require('./controller/add-audience-controller.js');
var createCollectionController = require('./controller/create-collection-controller.js');
var createPresentationController = require('./controller/create-presentation-controller.js');
var editTransformationsController = require('./controller/edit-transformations-controller.js');
var generatePresentationController = require('./controller/generate-presentation-controller.js');
var presentationsController = require('./controller/presentations-controller.js');
var presentationDetailsController = require('./controller/presentation-details-controller.js');
var openCollectionController = require('./controller/open-collection-controller.js');
var selectImagesController = require('./controller/select-images-controller.js');
var startPageController = require('./controller/start-page-controller.js');
var windowController = require('./controller/window-controller.js');

var dalService = require('./service/dal-service.js');
var presentationEditorService = require('./service/presentation-editor-service.js');
var runtimePreferencesService = require('./service/runtime-preferences-service.js');

// Services.
coreApp
  .service('DalService', dalService)
  .service('PresentationEditorService', presentationEditorService)
  .service('RuntimePreferencesService', runtimePreferencesService);

// Controllers.
coreApp
  .controller('AddAudienceController', ['$scope', 'DalService', addAudienceController])
  .controller(
    'CreateCollectionController',
    ['$scope', 'DalService', 'RuntimePreferencesService', createCollectionController]
  )
  .controller(
    'CreatePresentationController',
    ['$scope', 'DalService', 'RuntimePreferencesService', 'PresentationEditorService', createPresentationController]
  )
  .controller(
    'EditTransformationsController',
    ['$scope', 'PresentationEditorService', editTransformationsController]
  )
  .controller(
    'GeneratePresentationController',
    ['$scope', '$routeParams', 'DalService', 'RuntimePreferencesService', generatePresentationController]
  )
  .controller(
    'OpenCollectionController',
    ['$scope', 'DalService', 'RuntimePreferencesService', openCollectionController]
  )
  .controller(
    'PresentationDetailsController',
    ['$scope', '$routeParams', 'DalService', 'RuntimePreferencesService', presentationDetailsController]
  )
  .controller('PresentationsController', ['$scope', 'DalService', 'PresentationEditorService', presentationsController])
  .controller(
    'SelectImagesController',
    ['$scope', 'hotkeys', 'DalService', 'PresentationEditorService', selectImagesController]
  )
  .controller('StartPageController', ['$scope', startPageController])
  .controller('WindowController', ['$scope', windowController]);

// Views.
coreApp.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/add-audience',
    {
      controller: 'AddAudienceController',
      templateUrl: 'template/add-audience.html'
    })
    .when('/create-collection',
    {
      controller: 'CreateCollectionController',
      templateUrl: 'template/create-collection.html'
    })
    .when('/create-presentation',
    {
      controller: 'CreatePresentationController',
      templateUrl: 'template/create-presentation.html'
    })
    .when('/edit-transformations',
    {
      controller: 'EditTransformationsController',
      templateUrl: 'template/edit-transformations.html'
    })
    .when('/generate-presentation:presentationId',
    {
      controller: 'GeneratePresentationController',
      templateUrl: 'template/generate-presentation.html'
    })
    .when('/presentation-details:presentationId',
    {
      controller: 'PresentationDetailsController',
      templateUrl: 'template/presentation-details.html'
    })
    .when('/presentations',
    {
      controller: 'PresentationsController',
      templateUrl: 'template/presentations.html'
    })
    .when('/open-collection',
    {
      controller: 'OpenCollectionController',
      templateUrl: 'template/open-collection.html'
    })
    .when('/select-images',
    {
      controller: 'SelectImagesController',
      templateUrl: 'template/select-images.html'
    })
    .when('/start-page',
    {
      controller: 'StartPageController',
      templateUrl: 'template/start-page.html'
    })
    .otherwise({ redirectTo: '/start-page' });
}]);

// Directives.
coreApp.directive('descriptionDialog', function() {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: 'template/dialog/description-dialog.html'
  };
});
coreApp.directive('rotateDialog', function() {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: 'template/dialog/rotate-dialog.html'
  };
});
coreApp.directive('scaleDialog', function() {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: 'template/dialog/scale-dialog.html'
  };
});

// Filters.
coreApp.filter('presentationTitleFilter', function () {
  return function (presentations, value) {
    if (!value || value.toString().trim() === '') {
      return presentations;
    }
    var result = [];
    for (let i = 0; i < presentations.length; i++) {
      if (presentations[i].title.indexOf(value) !== -1) {
        result.push(presentations[i]);
      }
    }
    return result;
  };
});

// Extend root scope.
coreApp.run(function ($rootScope, $location) {
  // Display errors.
  $rootScope.displayMessage = false;
  $rootScope.error = null;

  $rootScope.clearError = function () {
    $rootScope.displayMessage = false;
    $rootScope.error = null;
  };

  $rootScope.toggleMessage = function () {
    $rootScope.displayMessage = !$rootScope.displayMessage;
  };

  $rootScope.setError = function (errorMessage) {
    $rootScope.error = errorMessage;
    $rootScope.displayMessage = true;
    setTimeout(
      () => {
        $rootScope.displayMessage = false;
        $rootScope.$apply();
      },
      3000);
  };

  // History and navigation.
  var history = [];

  $rootScope.$on('$routeChangeSuccess', function () {
    history.push($location.$$path);
  });

  $rootScope.back = function () {
    this.clearError();
    var prevUrl = history.length > 1 ? history.splice(-2)[0] : '/';
    $location.path(prevUrl);
  };

  $rootScope.changeView = function (url) {
    this.clearError();
    $location.path(url);
  };

  $rootScope.home = function () {
    this.clearError();
    $location.path('/');
  };

  $rootScope.resetHistory = function (origo) {
    history = [];
    if (origo) {
      history.push(origo);
    }
  };
});

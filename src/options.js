
function niceAlert(msg, type) {
  type = (typeof type != "undefined") ? type : 'success';
  var $message = $('<div class="alert alert-'+type+'">');
  $message.html(msg);
  $('#alert-wrapper').html($message);
  $message.fadeOut(3000);
}


var hostReplace = angular.module('host-replace', ['ngResource']);
hostReplace.factory('replacementsService', function($rootScope) {
  var sharedService = {};

  sharedService.data = [];
  sharedService.append = true;

  sharedService.import = function(data, append) {
    sharedService.data = data;
    sharedService.append = append;
    $rootScope.$broadcast('import');
  };

  sharedService.save = function() {
    $rootScope.$broadcast('save');
  };

  return sharedService;
});

hostReplace.controller('ReplacementsCtrl', function($scope, replacementsService) {
  var master = (function(){
    var returnData = {
      replacements:[
        {search:'', replace:''}
      ]
    };
    if (localStorage.options) {
      var replacementsTmp = JSON.parse(localStorage.options);
      if (replacementsTmp.replacements.length > 0) {
        returnData = replacementsTmp;
      }
    }
    return returnData;
  })();

  $scope.cancel = function() {
    $scope.form = angular.copy(master);
  };

  $scope.save = function() {
    master = $scope.form;
    localStorage.options = angular.toJson(master);
    localStorage.reloadCache = '1';
    niceAlert('Saved successfully');
    $scope.cancel();
  };

  $scope.addReplacement = function() {
    $scope.form.replacements.push({search:'', replace:''});
  };

  $scope.removeReplacement = function(replacement) {
    var replacements = $scope.form.replacements;
    for (var i = 0, ii = replacements.length; i < ii; i++) {
      if (replacement === replacements[i]) {
        replacements.splice(i, 1);
      }
    }
  };

  $scope.isCancelDisabled = function() {
    return angular.equals(master, $scope.form);
  };

  $scope.isSaveDisabled = function() {
    return $scope.myForm.$invalid || angular.equals(master, $scope.form);
  };

  $scope.$on('import', function() {
    if (!replacementsService.append) {
      $scope.form.replacements = replacementsService.data;
    } else {
      $scope.form.replacements = $scope.form.replacements || [];
      for (var i in replacementsService.data) {
        $scope.form.replacements.push(replacementsService.data[i]);
      }
    }
  });

  $scope.$on('save', function() {
    $scope.save();
  });

  // puts the initial state of master into the form
  $scope.cancel();
});

hostReplace.controller('ImportCtrl', function($scope, replacementsService){
  $scope.importData = '[]';

  function validate(json) {
    try {
      var result = JSON.parse(json);
    } catch (e) {
      niceAlert('invalid json: ' + e, 'danger');
      return false;
    }
    if (!result.hasOwnProperty('replacements')) {
      niceAlert('Missing \'replacements\' as the top level key of the object', 'danger');
      return false;
    }
    var replacements = result.replacements;
    for (var i in replacements) {
      var replacement = replacements[i];
      if (!(replacement.hasOwnProperty('search') && replacement.hasOwnProperty('replace'))) {
        niceAlert('all replacements must have a search and a replace specified', 'danger');
        return false;
      }
    }
    return replacements;
  }
  $scope.doIt = function(append){
    var data = validate($scope.importData);
    if (data) {
      replacementsService.import(data, !!append);
      replacementsService.save();
    }
  };
});


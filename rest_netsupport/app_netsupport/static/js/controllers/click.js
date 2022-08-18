app.controller("click", function ($scope, $rootScope, $http, $location, config, $route, $routeParams, $window) {
  $scope.msg = "Aguardando confirmação";
  $scope.status = 'sucesso'

  $scope.get = function(){
    $http({
        url: config.base_url + "/click/"+$scope.acao+"?token=" + escape($routeParams.token) + "&sig=" + escape($routeParams.sig) ,
        method: 'GET',
    }).success(function(data, status) {
      $scope.msg = data.msg
    }).error(function (data, status) {
      $scope.status = null
      $scope.msg = data.msg
    })
  }
  
  if ($route.current.originalPath == '/click/deslocamento')
    $scope.acao = 'deslocamento'
  if ($route.current.originalPath == '/click/checkin')
    $scope.acao = 'checkin'

  $rootScope.modal_confirmacao({
    cb: $scope.get,
    msg:  `Deseja confirmar o ${$scope.acao} ?`
  })
})

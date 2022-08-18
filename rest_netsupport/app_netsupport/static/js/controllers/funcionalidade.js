app.controller('funcionalidade', function($scope, $rootScope, $http, $location, config, $route, $routeParams) {

  $scope.funcionalidades = []

  $scope.opcoes = {
    metodo: config.opcoes.metodo,
    menu: config.opcoes.menu
  }

  $scope.init = function() {
    $scope.funcionalidade = {
      nome: null,
      icone: 'flaticon-question-mark-inside-a-circle',
      url: null,
      metodo: null,
      menu: null
    }
  }

  /** ==============
     * METODOS
     ==============**/
  $scope.lista = function(filtros) {
    let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
    $http({
        url: config.base_url + '/funcionalidade/lista',
        method: 'POST',
        data: filtro_otimizado
    }).success(function(data, status) {
        $scope.funcionalidades = data
    }).error(function(data, status) {
        $scope.funcionalidades = []
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.adiciona = function(funcionalidade) {
    $http({
      url: config.base_url + '/funcionalidade',
      method: 'POST',
      data: funcionalidade
    })
      .success(function(data, status) {
        $rootScope.adiciona_historico(data, status)
        $scope.init()
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.detalha = function(id_funcionalidade) {
    $http({
      url: config.base_url + '/funcionalidade/' + id_funcionalidade,
      method: 'GET'
    })
      .success(function(data, status) {
        $scope.funcionalidade = data
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.altera = function(funcionalidade) {
    $http({
      url: config.base_url + '/funcionalidade/' + funcionalidade.id,
      method: 'PUT',
      data: funcionalidade
    })
      .success(function(data, status) {
        $rootScope.adiciona_historico(data, status)
        $scope.detalha(funcionalidade.id)
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.deleta = function({id_grupo}) {
    $http({
      url: config.base_url + '/funcionalidade/' + id_grupo,
      method: 'DELETE'
    })
      .success(function(data, status) {
        $rootScope.adiciona_historico(data, status)
        $scope.lista($scope.filtros)
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  // detalha funcionalidade
  if ($route.current.originalPath == '/funcionalidade/:id_funcionalidade') {
    $scope.detalha($routeParams.id_funcionalidade)
  }
  // form adiciona funcionalidade
  if ($route.current.originalPath == '/funcionalidade/adiciona') {
    $scope.init()
  }
})

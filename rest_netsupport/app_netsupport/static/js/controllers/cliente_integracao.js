app.controller('cliente_integracao', function(
  $scope,
  $rootScope,
  $http,
  config,
  $routeParams,
  $route,
  $window,
  $location
) {
  $scope.integracoes = []

  $scope.adiciona = function(dados) {
    $http({
      url: config.base_url + '/cliente_integracao',
      method: 'POST',
      data: dados
    })
      .success(function(data, status) {
        $rootScope.adiciona_historico(data, status)
        $location.path("/cliente/integracao/" + data.id)
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.lista = function(filtros) {
    $http({
      url: config.base_url + '/cliente_integracao/lista',
      data: filtros,
      method: 'POST'
    })
      .success(function(data, status) {
        $scope.integracoes = data
      })
      .error(function(data, status) {
        $scope.integracoes = []
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.get = function(id_integracao) {
    $http({
      url: config.base_url + '/cliente_integracao/' + id_integracao,
      method: 'GET'
    })
      .success(function(data, status) {
        $scope.integracao = data
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.altera = function(dados) {
    $http({
      url: config.base_url + '/cliente_integracao/' + dados.id,
      method: 'PUT',
      data: dados
    }).success(function(data, status) {
        $rootScope.adiciona_historico(data, status)
        $scope.get(dados.id)
    }).error(function(data, status) {
        $rootScope.erro_portal(data, status)
    })
  }

  $scope.deleta = function({id_integracao}) {
    $http({
      url: config.base_url + '/cliente_integracao/' + id_integracao,
      method: 'DELETE'
    })
      .success(function(data, status) {
        $rootScope.adiciona_historico(data, status)
        $scope.lista()
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.remove_tokens = function({id_integracao}) {
    $http({
      url: config.base_url + '/cliente_integracao/' + id_integracao + '/token',
      method: 'DELETE'
    })
      .success(function(data, status) {
        $rootScope.adiciona_historico(data, status)
        $scope.lista()
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.verifica_autorizacao = function(dados) {
    $http({
      url: config.base_url + '/cliente_integracao/verifica_autorizacao',
      method: 'POST',
      data: dados
    })
      .success(function(data, status) {
        $scope.autorizacao = data
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.autoriza = function(dados) {
    $http({
      url: config.base_url + '/cliente_integracao/autoriza',
      method: 'POST',
      data: dados
    })
      .success(function(data, status) {
        $rootScope.erro_portal(
          'Acesso autorizado com sucesso. Redirecionando para sistema de origem...',
          status
        )
        $window.location.href = data.url
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  $scope.bloqueia = function(dados) {
    $http({
      url: config.base_url + '/cliente_integracao/bloqueia',
      method: 'POST',
      data: dados
    })
      .success(function(data, status) {
        $rootScope.erro_portal(
          'Acesso bloqueado!! Redirecionando para sistema de origem...',
          status
        )
        console.log(data)
        $window.location.href = data.url
      })
      .error(function(data, status) {
        $rootScope.erro_portal(data, status)
      })
  }

  // ROTEAMENTO
  if ($route.current.originalPath == '/cliente/integracao/verifica_autorizacao') {
    parametros_faltantes = []
    parametros_obrigatorios = ['client_id', 'response_type', 'redirect_uri', 'scope', 'state']
    parametros_obrigatorios.forEach(function(parametro) {
      if (!$routeParams[parametro]) parametros_faltantes.push(parametro)
    })
    if (parametros_faltantes.length == 0) $scope.verifica_autorizacao($routeParams)
    else
      alert(
        'Os seguintes campos são obrigatórios e não foram informados: ' +
          parametros_faltantes.join(', ')
      )
  }
  if ($route.current.originalPath == '/cliente/integracao/:id_integracao') {
    $scope.get($routeParams.id_integracao)
  }

})

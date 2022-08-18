app.controller("integracao", function ($scope, $http, $location, config, $rootScope, $window, $routeParams, $route){

    $scope.init = function() {
        $scope.integracao = {
            tipo: 'oauth2'
        }
    }

    $scope.lista = function() {
        $http({
            url: config.base_url + '/integracao/lista',
            method: 'POST'
        }).success(function(data, status) {
            data.filter(function (item) {
              item.imagem = 'logo_contaazul.png'
            })
            $scope.integracoes = data
        })
        .error(function (data, status) {
            $scope.integracoes = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (integracao) {
        $http({
            url: config.base_url + '/integracao',
            method: 'POST',
            data : integracao
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.init()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha = function (id_integracao) {
        $http({
            url: config.base_url + '/integracao/' + id_integracao,
            method: 'GET'
        }).success(function(data, status) {
            $scope.integracao = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function (integracao) {
        $http({
            url: config.base_url + '/integracao/' + integracao.id,
            method: 'PUT',
            data : integracao
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.detalha(integracao.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.remove = function ({id_integracao}) {
	   $http({
            url: config.base_url + '/integracao/' + id_integracao,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.lista()
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

	/** ==============
     * METODO AUTORIZACAO
     ==============**/
    $scope.autenticar = function (integracao) {
        $http({
            url: config.base_url + '/integracao/' + integracao.id +'/autorizacao',
            method: 'GET',
            data : integracao
        }).success(function(data, status) {
            $window.open(data.url, "_top")
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    $scope.callback = function (parametros) {
        $http({
            url: config.base_url + '/integracao/callback?' + $.param(parametros),
            method: 'GET'
        }).success(function(data, status) {
            if(data.status == 'OK') {
                $rootScope.adiciona_historico('Autorização realizada com sucesso.', status)
                $location.path('/integracao')
            }
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    // lista integrações
    if ($route.current.originalPath == '/integracao'){
        $scope.lista()
    }
    // Chama métodos se está na url de detalha
    if ($route.current.originalPath == '/integracao/:id_integracao'){
        $scope.detalha($routeParams.id)
    }
    // form adiciona integracao
    if ($route.current.originalPath == '/integracao/adiciona'){
        $scope.init()
    }
    // url de callback de uma autorização
    if ($route.current.originalPath == '/integracao/callback'){
        $scope.callback($routeParams)
    }
})

app.controller("banco_ns", function ($scope, $rootScope, $http, config, $route, $routeParams) {

    $scope.bancos = []

    $scope.lista_banco = function() {
        $http({
            url: config.base_url + "/banco/lista",
            method: 'POST'
        }).success(function(data, status) {
            $scope.bancos = data
        })
        .error(function(data, status) {
            $scope.bancos = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + "/banco_ns/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.bancos_ns = data
        }).error(function (data, status) {
            $scope.bancos_ns = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (dados) {
        console.log(dados)
        $http({
            url: config.base_url + "/banco_ns",
            method: 'POST',
            data : dados
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.banco_ns = {}
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function(id_banco) {
        $http({
            url: config.base_url + "/banco_ns/" + id_banco,
            method: 'GET'
        }).success(function(data, status) {
            $scope.banco_ns = data
        })
        .error(function (data, status) {
            $scope.banco_ns = {}
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function (dados) {
        $http({
            url: config.base_url + "/banco_ns/" + dados.id,
            method: 'PUT',
            data : dados
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.get(dados.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.desativa = function ({id_banco}) {
	    $http({
            url: config.base_url + "/banco_ns/" + id_banco,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.ativa = function ({id_banco}) {
        
        $http({
            url: config.base_url + "/banco_ns/" + id_banco,
            method: 'POST'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    // detalha
    if ($route.current.originalPath == '/banco_ns/:id_banco'){
        $scope.lista_banco()
        $scope.get($routeParams.id_banco)
    }
    // form novo banco ns
    if ($route.current.originalPath == '/banco_ns/adiciona'){
        $scope.lista_banco()
        $scope.banco_ns = {}
    }

})

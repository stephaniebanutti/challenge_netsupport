app.controller("flag", function ($scope, $rootScope, $http, $location, config, $timeout, $routeParams, $route) {

    $scope.flags = []
    $scope.filtros = {}

    $scope.init = function () {
        $scope.flag = {
            'filtro' : null,
            'flag': null,
            'descricao': null,
            'prioridade': null,
        }
    }


    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)

        $http({
            url: config.base_url + "/flag/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.flags = data
        })
        .error(function (data, status) {
            $scope.flags = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (dados) {
        $http({
            url: config.base_url + "/flag",
            data : dados,
            method: 'POST'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function(id_flag) {
        $http({
            url: config.base_url + "/flag/" + id_flag,
            method: 'GET'
        }).success(function(data, status) {
            $scope.flag = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function(dados) {
        $http({
            url: config.base_url + "/flag/" + dados.id,
            method: 'PUT',
            data : dados
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get(dados.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta = function({id_flag}) {
	   $http({
            url: config.base_url + "/flag/" + id_flag,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.ativa = function (id_flag) {
       $http({
            url: config.base_url + "/flag/" + id_flag + "/status",
            method: 'PUT'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista()
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    // ROTEAMENTO
    if ($route.current.originalPath == '/flag/:id_flag'){
        $scope.get($routeParams.id_flag)
    }

    if ($route.current.originalPath == '/flag/adiciona'){
        $scope.init()
    }

})

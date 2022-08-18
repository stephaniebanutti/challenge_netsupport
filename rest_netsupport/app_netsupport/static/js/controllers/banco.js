app.controller("banco", function ($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    $scope.bancos = []

    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + '/banco/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.bancos = data
        }).error(function (data, status) {
            $scope.bancos = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (banco) {
        $http({
            url: config.base_url + '/banco',
            method: 'POST',
            data : banco
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.banco = {}
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function (id_banco) {
        $http({
            url: config.base_url + '/banco/' + id_banco,
            method: 'GET'
        }).success(function(data, status) {
            $scope.banco = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function (banco) {
        $http({
            url: config.base_url + '/banco/' + banco.id,
            method: 'PUT',
            data : banco
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get(banco.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta = function ({id_banco}) {
        $http({
            url: config.base_url + '/banco/' + id_banco,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    // ROTEAMENTO
    if ($route.current.originalPath == '/banco/:id_banco')
        $scope.get($routeParams.id_banco)

})

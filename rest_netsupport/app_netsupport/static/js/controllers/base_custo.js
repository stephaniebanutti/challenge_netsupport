app.controller("base_custo", function ($scope, $rootScope, $http, config, $routeParams, $route) {

    $scope.base_custos = []


    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + "/base_custo/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.base_custos = data
        }).error(function (data, status) {
            $scope.base_custos = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (base_custo) {
        $http({
            url: config.base_url + "/base_custo",
            method: 'POST',
            data : base_custo
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.base_custo = {}
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function(id_base_custo) {
        $http({
            url: config.base_url + "/base_custo/" + id_base_custo,
            method: 'GET'
        }).success(function(data, status) {
            $scope.base_custo = data
        })
        .error(function (data, status) {
            $scope.base_custo = {}
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function(base_custo) {
        $http({
            url: config.base_url + "/base_custo/" + base_custo.id,
            method: 'PUT',
            data : base_custo
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get(base_custo.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta = function({id_base_custo}) {
	   $http({
            url: config.base_url + "/base_custo/" + id_base_custo,
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
    if ($route.current.originalPath == '/base_custo/:id_base_custo')
        $scope.get($routeParams.id_base_custo)

    if ($route.current.originalPath == '/base_custo/adiciona')
        $scope.base_custo = {}

})

app.controller("pendencia", function ($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    $scope.pendencias = []


    $scope.lista = function(filtro) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtro)
        $http({
            url: config.base_url + '/pendencia/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.pendencias = data;
        })
        .error(function (data, status) {
            $scope.pendencias = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (pendencia) {
        $http({
            url: config.base_url + '/pendencia',
            method: 'POST',
            data : pendencia
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.pendencia = {}
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha = function (id_pendencia) {
        $http({
            url: config.base_url + '/pendencia/' + id_pendencia,
            method: 'GET'
        }).success(function(data, status) {
            $scope.pendencia = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        });
    };

    $scope.altera = function (pendencia) {
        $http({
            url: config.base_url + '/pendencia/' + pendencia.id,
            method: 'PUT',
            data : pendencia
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.detalha(pendencia.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.remove = function ({pendencia}) {
        $http({
            url: config.base_url + '/pendencia/' + pendencia.id,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
             $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    if ($route.current.originalPath == '/pendencia/:id_pendencia'){
        $scope.detalha($routeParams.id_pendencia)
    }
    if ($route.current.originalPath == '/pendencia/adiciona'){
        $scope.pendencia = {}
    }
})

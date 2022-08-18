app.controller("cidade_brasil", function ($scope, $rootScope, $http, $location, config, $routeParams, $route) {

    $scope.cidades = []

    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + base_url_cidade,
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.cidades = data
        }).error(function (data, status) {
            $scope.cidades = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (cidade) {
        $http({
            url: config.base_url + base_url_cidade,
            method: 'POST',
            data : cidade
        }).success(function(data, status) {
            $rootScope.adiciona_historico("Cidade '"+cidade.cidade+"' gravado com sucesso.", status)
            $scope.cidade = {}
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function (id_cidade) {
        $http({
            url: config.base_url + base_url_cidade + "/" + id_cidade,
            method: 'GET'
        }).success(function(data, status) {
            $scope.cidade = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function (cidade) {
        $http({
            url: config.base_url + base_url_cidade + "/" + cidade.id,
            method: 'PUT',
            data : cidade
        }).success(function(data, status) {
            $rootScope.adiciona_historico("Cidade "+cidade.nome+"' alterado com sucesso.", status)
            $location.path('/cidade_brasil')
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta = function ({id_cidade}) {
       $http({
            url: config.base_url + base_url_cidade +"/" + id_cidade,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico("Cidade deletado com sucesso.", status)
            $scope.lista()
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    // detalha cidade_brasil
    if ($route.current.originalPath == '/cidade_brasil/:id_cidade')
        $scope.get($routeParams.id_cidade)
    // adiciona nova cidade
    if ($route.current.originalPath == '/cidade_brasil/adiciona')
        $scope.init()

})

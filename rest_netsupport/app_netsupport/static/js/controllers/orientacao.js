app.controller("orientacao", function($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    $scope.orientacoes = []
    $scope.clientes = []
    $scope.filtros = {}
    $scope.init_orientacao = function() {
        $scope.orientacao = {}
    }

    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + "/orientacao/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.orientacoes = data
        }).error(function(data, status) {
            $scope.orientacoes = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function(orientacao) {
        $http({
            url: config.base_url + "/orientacao",
            method: 'POST',
            data : orientacao
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_orientacao()
        }).error(function(data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    $scope.altera_status = function(orientacao) {
        $http({
            url: config.base_url + "/orientacao/" + orientacao.id + "/status",
            method: 'PUT',
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function(data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function(orientacao) {
        $http({
            url: config.base_url + "/orientacao/" + orientacao.id,
            method: 'PUT',
            data : orientacao
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get(orientacao.id)
        })
        .error(function(data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.remove = function({orientacao}) {
       $http({
            url: config.base_url + "/orientacao/" + orientacao.id,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function(data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    $scope.get = function(id_orientacao) {
        $http({
            url: config.base_url + "/orientacao/" + id_orientacao,
            method: 'GET'
        }).success(function(data, status) {
            $scope.orientacao = data
        })
        .error(function(data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_cliente = function() {
        let filtros = {
            status: "ativo"
        }
        $http({
            url: config.base_url + "/cliente/lista",
            method: 'POST',
            data: filtros
        }).success(function(data, status) {
            data.splice(0, 0, {id: undefined, nome_cliente: "SELECIONE"})
            $scope.clientes = data
        }).error(function(data, status) {
            $scope.cliente = []
            $rootScope.erro_portal(data, status)
        })
    }


    // ROTEAMENTO
    if ($route.current.originalPath == '/orientacao'){
        $scope.lista_cliente()
    }
    if ($route.current.originalPath == '/orientacao/:id_orientacao'){
        $scope.get($routeParams.id_orientacao)
    }
    if ($route.current.originalPath == '/orientacao/adiciona'){
        $scope.lista_cliente()
        $scope.init_orientacao()
    }
})

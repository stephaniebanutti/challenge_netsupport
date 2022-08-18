app.controller("cliente_cliente", function ($scope, $rootScope, $http, $location, config, $timeout, $routeParams, $route) {

    $scope.clientes = []
    $scope.cliente_clientes = []

    $scope.limpa_filtros = function(){
        $scope.filtros = {
            'nome' : null,
            'id_cliente': null,
        }
    }
    $scope.init = function(){
        $scope.cliente_cliente = {
            'nome' : null,
            'id_cliente': null,
        }
    }

    $scope.limpa_filtros()



    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + "/cliente_cliente/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.cliente_clientes = data
        })
        .error(function (data, status) {
            $scope.cliente_clientes = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_clientes = function(insere_seleciona) {
        $http({
            url: config.base_url + "/cliente/lista",
            method: 'POST'
        }).success(function(data, status) {
            if (insere_seleciona)
                data.splice(0, 0, {id: null, nome_cliente: "SELECIONE"})
            $scope.clientes = data
        })
        .error(function (data, status) {
            $scope.clientes = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (cliente_cliente) {
        $http({
            url: config.base_url + "/cliente_cliente",
            method: 'POST',
            data : cliente_cliente
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function(id_cliente_cliente) {
        $http({
            url: config.base_url + "/cliente_cliente/" + id_cliente_cliente,
            method: 'GET'
        }).success(function(data, status) {
            $scope.cliente_cliente = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function(cliente_cliente) {
        $http({
            url: config.base_url + "/cliente_cliente/" + cliente_cliente.id,
            method: 'PUT',
            data : cliente_cliente
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get(cliente_cliente.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta = function({id_cliente_cliente}) {
	   $http({
            url: config.base_url + "/cliente_cliente/" + id_cliente_cliente,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.ativa = function(id_cliente_cliente){
       $http({
            url: config.base_url + "/cliente_cliente/" + id_cliente_cliente + "/status",
            method: 'PUT'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista()
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_clientes(true)

    // ROTEAMENTO
    if ($route.current.originalPath == '/cliente_cliente/:id_cliente_cliente'){
        $scope.get($routeParams.id_cliente_cliente)
    }

    if ($route.current.originalPath == '/cliente_cliente/adiciona'){
        $scope.init()
    }

})

app.controller("tipo_servico", function ($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    $scope.tipo_servicos = []
    $scope.especialidades = []
    $scope.limpa_filtros = function(){
        $scope.filtros = {}
    }

    $scope.init_tipo_servico = function () {
        $scope.tipo_servico = {}
    }


    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + "/tipo_servico/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.tipo_servicos = data
        }).error(function (data, status) {
            $scope.tipo_servicos = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (tipo_servico) {
        $http({
            url: config.base_url + "/tipo_servico",
            method: 'POST',
            data : tipo_servico
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_tipo_servico()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function (id_tipo_servico) {
        $http({
            url: config.base_url + "/tipo_servico/" + id_tipo_servico,
            method: 'GET'
        }).success(function(data, status) {
            $scope.tipo_servico = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function (tipo_servico) {
        $http({
            url: config.base_url + "/tipo_servico/" + tipo_servico.id,
            method: 'PUT',
            data : tipo_servico
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get(tipo_servico.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.desativa = function ({id_tipo_servico}) {
	   $http({
            url: config.base_url + "/tipo_servico/" + id_tipo_servico,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.ativa = function (id_tipo_servico) {
	   $http({
            url: config.base_url + "/tipo_servico/" + id_tipo_servico + "/status",
            method: 'PUT'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    $scope.lista_especialidade = function(insere_selecione) {
        $http({
            url: config.base_url + "/especialidade/lista",
            method: 'POST'
        }).success(function (data, status) {
            if (insere_selecione)
                data.splice(0, 0, {id: undefined, nome: "SELECIONE"})
            $scope.especialidades = data
        }).error(function (data, status) {
            $scope.especialidades = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_base_custo = function(insere_selecione){
        $http({
            url: config.base_url + "/base_custo/lista",
            method: 'POST'
        }).success(function(data, status) {
            if (insere_selecione)
                data.splice(0, 0, {id: undefined, nome: "SELECIONE"})
            $scope.bases_custo = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.reseta_duracao_alocacao = function(){
        if ($scope.tipo_servico.tipo == 'atendimento'){
            $scope.tipo_servico.duracao_alocacao = 1
            $scope.tipo_servico.duracao_folga = '00:00'
        }
    }

    $scope.reseta_valor_deslocamento = function(){
        if (['variavel', 'zero'].indexOf($scope.tipo_servico.tipo_deslocamento) >= 0){
            $scope.tipo_servico.valor_deslocamento_fixo = 0.00
        }
    }


    $scope.lista_base_custo(true)
    $scope.lista_especialidade(true)
    $scope.init_tipo_servico()


    // Detalha
    if ($route.current.originalPath == '/tipo_servico/:id_tipo_servico'){
        $scope.get($routeParams.id_tipo_servico)
    }
})

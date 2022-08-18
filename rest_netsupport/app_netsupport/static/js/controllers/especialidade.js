app.controller('especialidade', function ($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    $scope.especialidades = []
    $scope.areas = []
    $scope.competencias = []
    $scope.especialidade_selecionada = {}
    $scope.area_selecionada = {}

    $scope.opcoes = {
        area_competencia: [
            {id: null, nome: "SELECIONE ESPECIALIDADE"}
        ]
    }


    $scope.init = function(){
        $scope.especialidade = {
            'nome' : null
        }

        $scope.area = {
            'id_especialidade'  : null,
            'nome'              : null
        }
        $scope.competencia = {
            'id_especialidade'  : null,
            'id_area'           : null,
            'nome'              : null,
            'descricao'         : null
        }
    }

    $scope.init_area = function(){
        $scope.area = {
            'id_especialidade'  : null,
            'nome'              : null
        }
    }


     // * METODOS ESPECIALIDADE
    $scope.lista_especialidade = function(adiciona_seleciona) {
        $http({
            url: config.base_url + '/especialidade/lista',
            method: 'POST'
        }).success(function (data, status) {
            if (adiciona_seleciona)
                data.splice(0, 0, {id: null, nome: "SELECIONE"})
            $scope.especialidades = data
        }).error(function (data, status) {
            $scope.especialidades = []
            $scope.areas = []
            $scope.competencias = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona_especialidade = function (especialidade) {
        $http({
            url: config.base_url + '/especialidade',
            method: 'POST',
            data : especialidade
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha_especialidade = function (id_especialidade) {
        $http({
            url: config.base_url + '/especialidade/' + id_especialidade,
            method: 'GET'
        }).success(function(data, status) {
            $scope.especialidade = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera_especialidade = function(especialidade){
        $http({
            url: config.base_url + '/especialidade/' + especialidade.id,
            method: 'PUT',
            data : especialidade
        }).success(function(data, status){
            $rootScope.adiciona_historico(data, status)
        })
        .error(function(data, status){
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta_especialidade = function({id_especialidade}) {
	   $http({
            url: config.base_url + '/especialidade/' + id_especialidade,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_especialidade()
            $scope.areas = []
            $scope.competencias = []
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.seleciona_especialidade = function(especialidade){
        if (especialidade == $scope.especialidade_selecionada){
            $scope.areas = []
            $scope.competencias = []
            $scope.especialidade_selecionada.selecionada = false
            $scope.especialidade_selecionada = {}
        }
        else{
            if ($scope.especialidade_selecionada)
                $scope.especialidade_selecionada.selecionada = false
            $scope.especialidade_selecionada = especialidade
            $scope.especialidade_selecionada.selecionada =  true
            $scope.lista_area(especialidade.id)
            $scope.competencias = []
        }
    }


     // ÁREA
    $scope.lista_area = function (id_especialidade, adiciona_seleciona) {
        if (id_especialidade == ''){
            $scope.areas = []
            $scope.competencia.id_area = ''
            return
        }

        $http({
            url: config.base_url + '/area/lista',
            method: 'POST',
            data: {id_especialidade: id_especialidade}
        }).success(function(data, status) {
            if (adiciona_seleciona)
                data.splice(0, 0, {id: null, nome: "SELECIONE"})
            $scope.areas = data
        })
        .error(function (data, status) {
            $scope.areas = []
            if ($scope.competencia)
                $scope.competencia.id_area = ''
            if (status != 404)
                $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona_area = function (area) {
        $http({
            url: config.base_url + '/area',
            method: 'POST',
            data : area
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_area()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha_area = function (id_area) {
        $http({
            url: config.base_url + '/area/' + id_area,
            method: 'GET'
        }).success(function(data, status) {
            $scope.area = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera_area = function(area){
        $http({
            url: config.base_url + '/area/' + area.id,
            method: 'PUT',
            data : area
        }).success(function(data, status){
            $rootScope.adiciona_historico(data, status)
        })
        .error(function(data, status){
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta_area = function ({id_area}) {
        $http({
            url: config.base_url + '/area/' + id_area,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_area($scope.especialidade_selecionada.id)
            $scope.competencias = []
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.seleciona_area = function(area){
        if (area == $scope.area_selecionada){
            $scope.competencias = []
            $scope.area_selecionada.selecionada = false
            $scope.area_selecionada = {}
        }
        else{
            if ($scope.area_selecionada)
                $scope.area_selecionada.selecionada = false
            $scope.area_selecionada = area
            $scope.area_selecionada.selecionada =  true
            $scope.lista_competencia(area.id)
        }
    }


    /** ==============
     * METODOS COMPETENCIA
     ==============**/
    $scope.lista_competencia = function(id_area) {
        $http({
            url: config.base_url + '/competencia/lista',
            method: 'POST',
            data: {id_area: id_area}
        }).success(function(data, status) {
            $scope.competencias = data
        })
        .error(function (data, status) {
            $scope.competencias = []
            if (status != 404)
                $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona_competencia = function (competencia) {
        $http({
            url: config.base_url + '/competencia',
            method: 'POST',
            data : competencia
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init()
            $scope.areas = $scope.opcoes.area_competencia
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha_competencia = function (id_competencia) {
        $http({
            url: config.base_url + '/competencia/'+ id_competencia,
            method: 'GET'
        }).success(function(data, status) {
            $scope.competencia = data
            $scope.lista_especialidade()
            $scope.lista_area(data.id_especialidade)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera_competencia = function(competencia){
        $http({
            url: config.base_url + '/competencia/' + competencia.id,
            method: 'PUT',
            data : competencia
        }).success(function(data, status){
            $rootScope.adiciona_historico(data, status)
        })
        .error(function(data, status){
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta_competencia = function ({id_competencia}) {
	   $http({
            url: config.base_url + '/competencia/' + id_competencia,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data , status)
            $scope.lista_competencia($scope.area_selecionada.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    // detalha especialidade
    if ($route.current.originalPath == '/especialidade/:id_especialidade'){
        $scope.detalha_especialidade($routeParams.id_especialidade)
    }
    // form adiciona especialidade
    if ($route.current.originalPath == '/especialidade/adiciona'){
        $scope.init()
    }
    // detalha area
    if ($route.current.originalPath == '/especialidade/area/:id_area'){
        $scope.lista_especialidade(false)
        $scope.detalha_area($routeParams.id_area)
    }
    // form adiciona área
    if($route.current.originalPath == '/especialidade/area/adiciona') {
        $scope.lista_especialidade(true)
        $scope.init()
    }
    // detalha competência
    if ($route.current.originalPath == '/especialidade/competencia/:id_competencia'){
        $scope.detalha_competencia($routeParams.id_competencia)
    }
    // form adiciona competência
    if($route.current.originalPath == '/especialidade/competencia/adiciona') {
        $scope.lista_especialidade(true)
        $scope.areas = $scope.opcoes.area_competencia
        $scope.init()
    }
})

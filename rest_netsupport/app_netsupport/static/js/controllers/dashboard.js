app.controller("dashboard", function ($scope, $http, $rootScope, $timeout, $interval, config, $location) {

    /** ==============
    * URLS
    ==============**/
    const base_url_cliente = '/cliente'
    const base_url_cliente_cliente = '/cliente_cliente'
    const base_url_gestor_demanda = '/funcionario'
    const base_url_jobs = '/job'

    const path = $location.path()


    $scope.filtros = {
        clientes: [],
        cliente_cliente: [],
        status: [],
        sla: [],
        gestores: []
    }
    $scope.jobs = []
    $scope.cliente_cliente = []
    $scope.clientes = []
    $scope.gestores = []
    $scope.referencias = "off"


    $scope.filtra = function (filtros) {
        $scope.get_jobs(filtros)
    }

    $scope.get_jobs = function (filtros) {
        let filtro = $rootScope.otimiza_filtro(filtros)
        if (angular.equals({}, filtro))
            filtro = { status_simplificado: ['aberto', 'andamento'] }

        $http({
            url: config.base_url + '/job/novo_lista',
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            $scope.jobs = data
        })
            .error(function (data, status) {
                $scope.jobs = []
                if (status != 404)
                    $rootScope.erro_portal(data, status)
            })
    }

    // GET CLIENTES
    $scope.get_clientes = function () {
        $http({
            url: config.base_url + '/cliente/lista',
            method: 'POST',
            data: { status: 'ativo' }
        }).success(function (data, status) {
            $scope.clientes = data
        })
            .error(function (data, status) {
                $scope.clientes = []
                $rootScope.erro_portal(data, status)
            })
    }

    // GET PROJETOS
    $scope.get_cliente_cliente = function (clientes) {
        if (clientes != []) {
            $http({
                url: config.base_url + '/cliente_cliente/lista',
                method: 'POST',
                data: { id_cliente: clientes }
            }).success(function (data, status) {
                $scope.cliente_cliente = data
            })
                .error(function (data, status) {
                    $rootScope.erro_portal(data, status)
                    $scope.cliente_cliente = []
                })
        }
        else
            $scope.cliente_cliente = []
    }

    // GET GESTORES DE DEMANDA
    $scope.get_gestores = function () {
        let filtros = {
            id_grupo: 3
        }
        $http({
            url: config.base_url + '/funcionario/lista',
            method: 'POST',
            data: filtros
        }).success(function (data, status) {
            $scope.gestores = data;
        })
            .error(function (data, status) {
                $scope.gestores = []
                $rootScope.erro_portal(data, status)
            })
    }

    // MOSTRA REFERÊNCIAS
    $scope.mostra_referencias = function () {
        if ($scope.referencias == "off")
            $scope.referencias = "on"
        else
            $scope.referencias = "off"
    }

    // GET ACOMPANHA JOBS
    $scope.get_acompanha_job = function () {
        $http({
            url: config.base_url + '/job/dashboard2',
            method: 'GET'
        }).success(function (data, status) {
            $scope.pendencias_imediatas = data['pendencias_imediatas']
            $scope.pendencias_demoradas = data['pendencias_demoradas']
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    // CHAMA METODOS
    if (path == '/dashboard') {
        if ($rootScope.usuario_logado.grupo != 'Cliente') {
            $scope.get_clientes()
            $scope.get_gestores()
        }
        else {
            $scope.get_cliente_cliente([$rootScope.usuario_logado.id_cliente])
        }
        $scope.get_jobs($scope.filtros)
        if ($rootScope.usuario_logado.perfil != 'doutor') {
            $scope.dashabord_get_jobs = $interval(function () {
                $scope.get_jobs($scope.filtros)
            }, config.tempo_atualizacao_rotinas * 1000 * 20)
        }

    }

    if (path == '/supporter/dashboard') {
        $scope.get_jobs($scope.filtros)
    }

    if (path.indexOf('/acompanha_job') >= 0) {
        $scope.get_acompanha_job()
        if ($rootScope.usuario_logado.perfil == 'funcionario') {
            $scope.dashabord2_get_jobs = $interval(function () {
                $scope.get_acompanha_job()
            }, config.tempo_atualizacao_rotinas * 1000)
        }
    }
    $scope.$on("$destroy", function () {
        $interval.cancel($scope.dashabord_get_jobs)
        $interval.cancel($scope.dashabord2_get_jobs)
    })

    $rootScope.chat()

})

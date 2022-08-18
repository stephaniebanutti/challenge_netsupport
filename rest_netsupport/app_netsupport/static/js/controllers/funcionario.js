app.controller("funcionario", function ($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    $scope.funcionarios = []
    $scope.bancos = []

    $scope.init_funcionario = function () {
        $scope.funcionario = {}
        $scope.funcionario.operacao_conta = null
        $scope.funcionario.complemento = null
        $scope.funcionario.dv_agencia_banco = null
        $rootScope.desabilita_endereco()
    }


    $scope.operacao_conta_require = function (banco) {
        $scope.operacao_conta_cef = banco.search('104')
    }

    let idGrupo = document.getElementById('id_grupo')
  
    setTimeout(function () {
        if ($rootScope.usuario.nucleo_abertura_gd && idGrupo.options[idGrupo.selectedIndex].text == 'Gestor de Demanda') document.getElementById('nucleo_abertura').style.display = 'block'
    }, 1000)
    if (idGrupo) {
        idGrupo.onchange = () => {
            if ($rootScope.usuario.nucleo_abertura_gd && idGrupo.options[idGrupo.selectedIndex].text == 'Gestor de Demanda')
                document.getElementById('nucleo_abertura').style.display = 'block'
            else
                document.getElementById('nucleo_abertura').style.display = 'none'
        }
    }

    $scope.lista = function (filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)

        $http({
            url: config.base_url + '/funcionario/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function (data, status) {
            $scope.funcionarios = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
                $scope.funcionarios = []
            })
    }

    $scope.adiciona = function (funcionario) {
        $http({
            url: config.base_url + '/funcionario',
            method: 'POST',
            data: funcionario
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_funcionario()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha = function (id_funcionario) {
        $http({
            url: config.base_url + '/funcionario/' + id_funcionario,
            method: 'GET'
        }).success(function (data, status) {
            $scope.funcionario = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.altera = function (funcionario) {
        $http({
            url: config.base_url + '/funcionario/' + funcionario.id,
            method: 'PUT',
            data: funcionario
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.detalha(funcionario.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.grava = function (funcionario) {
        if ($scope.funcionario.nome_criado_por) {
            $scope.altera(funcionario)
        }
        else {
            $scope.adiciona(funcionario)
        }
    }

    $scope.desativa = function ({ id_funcionario }) {
        $http({
            url: config.base_url + '/funcionario/' + id_funcionario,
            method: 'DELETE'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.ativa = function (id_funcionario) {
        $http({
            url: config.base_url + '/funcionario/' + id_funcionario + "/status",
            method: 'PUT'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    /** ==============
     * SYNC SLACK
     ==============**/
    $scope.sync_slack = function (id_funcionario) {
        $http({
            url: config.base_url + '/funcionario/' + id_funcionario + "/slack",
            method: 'PUT'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista()
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    /** ==============
     * LISTA BANCO
     ==============**/
    $scope.lista_banco = function () {
        $http({
            url: config.base_url + "/banco/lista",
            method: 'POST'
        }).success(function (data, status) {
            $scope.bancos = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    /** ==============
     * LISTA GRUPO
     ==============**/
    $scope.lista_grupo = function () {
        let filtro = { perfil: 'funcionario' }
        $http({
            url: config.base_url + '/grupo/lista',
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            data.splice(0, 0, { id: undefined, nome: "SELECIONE" })
            $scope.grupos = data
        })
            .error(function (data, status) {
                $scope.grupos = []
                $rootScope.erro_portal(data, status)
            })
    }


    /** ==============
     * REDIRECIONAMENTOS
     ==============**/
    if ($route.current.originalPath == '/funcionario/:id_funcionario') {
        $scope.lista_banco()
        $scope.lista_grupo()
        $scope.detalha($routeParams.id_funcionario)
    }
    if ($route.current.originalPath = '/funcionario/adiciona') {
        $scope.init_funcionario()
        $scope.lista_banco()
        $scope.lista_grupo()
    }

})

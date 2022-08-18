app.controller("grupo", function ($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    $scope.grupos = []


    $scope.init = function () {
        $scope.grupo = {}
    }


    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + '/grupo/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.grupos = data
        }).error(function (data, status) {
            $scope.grupos = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (grupo) {
        $http({
            url: config.base_url + '/grupo',
            method: 'POST',
            data : grupo
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha = function (id_grupo) {
        $http({
            url: config.base_url + '/grupo/' + id_grupo,
            method: 'GET'
        }).success(function(data, status) {
            $scope.grupo = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function (grupo) {
        $http({
            url: config.base_url + '/grupo/' + grupo.id,
            method: 'PUT',
            data : grupo
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.detalha(grupo.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta = function ({id_grupo}) {
	   $http({
            url: config.base_url + '/grupo/' + id_grupo,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_permissao_grupo = function (grupo) {

        if(grupo.selecionado) {
            $scope.permissao_grupo = []
            $scope.grupo_id = null
            $scope.lista_usuario_grupo_invalido = null
            $scope.lista_usuario_grupo = null
            grupo.selecionado = false
            return
        }
        else{
            $scope.grupos.filter(function (grupo) {
                return grupo.selecionado = false
            })
            grupo.selecionado = true
            $scope.grupo_id = grupo.id
            let filtro = {"id_grupo": grupo.id}
            $http({
                url: config.base_url + '/permissao_grupo/lista',
                method: 'POST',
                data: filtro
            }).success(function(data, status) {
                $scope.permissao_grupo = data
            })
            .error(function (data, status) {
                $scope.permissao_grupo = []
            })

            $scope.lista_usuario_grupo_invalido = null
            $scope.lista_usuario_grupo = null

            if (grupo.nome == 'Cliente' || grupo.nome == 'Doutor') {
                $scope.lista_usuario_grupo_invalido = 'Para lista usuários do grupo "' + grupo.nome + '" acesse o menu do mesmo.'
            }
            else {
                $http({
                    url: config.base_url + '/grupo/' + grupo.id + "/usuario",
                    method: 'GET'
                }).success(function (data, status) {
                    $scope.lista_usuario_grupo = data
                })
                .error(function (data, status) {
                    $scope.lista_usuario_grupo = []
                })
            }
        }
    }


    // detalha grupo
    if ($route.current.originalPath == '/grupo/:id_grupo'){
        $scope.detalha($routeParams.id_grupo)
    }
    // form adiciona grupo
    if ($route.current.originalPath == '/grupo/adiciona'){
        $scope.init()
    }
})

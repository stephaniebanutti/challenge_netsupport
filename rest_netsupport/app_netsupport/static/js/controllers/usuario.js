app.controller("usuario", function ($scope, $rootScope, $http, $location, config, $routeParams, $route) {

    $scope.usuarios = []

    $scope.init = function () {
        $scope.usuario2 = {
            'nome' : null,
            'login' : null
        }
    }


    /** ==============
     * METODOS
     ==============**/
    $scope.lista = function(filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + '/usuario/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.usuarios = data;
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona = function (usuario) {
        $http({
            url: config.base_url + '/usuario',
            method: 'POST',
            data : usuario
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.usuario2 = {};
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha = function (id_usuario) {
        $http({
            url: config.base_url + '/usuario/' + id_usuario,
            method: 'GET'
        }).success(function(data, status) {
            $scope.usuario2 = data
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        });
    };

    $scope.altera = function (usuario) {
        $http({
            url: config.base_url + '/usuario/' + usuario.id,
            method: 'PUT',
            data : usuario
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.detalha(usuario.id)
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.desativa = function ({id_usuario}) {
	   $http({
            url: config.base_url + '/usuario/' + id_usuario,
            method: 'DELETE'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista();
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        });
    }

    $scope.ativa = function (id_usuario) {
	   $http({
            url: config.base_url + '/usuario/' + id_usuario + "/status",
            method: 'PUT'
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista();
        })
        .error(function (data, status) {
            $rootScope.erro_portal(data, status)
        });
    }


    $scope.altera_senha = function(usuario){
        if(usuario.nova_senha != usuario.confirma_nova_senha) {
            $rootScope.adiciona_historico(data, 403)
            return
        }
        $rootScope.seta_gravar(true)
        delete usuario.confirma_nova_senha
        $http({
            url: config.base_url + '/usuario/senha',
            method: 'PUT',
            data : usuario
        }).success(function(data, status){
            $rootScope.seta_gravar(false)
            $rootScope.adiciona_historico(data, status)
            usuario = {}
        })
        .error(function(data, status){
            $rootScope.seta_gravar(false)
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.reseta_senha = function(usuario){
        if(usuario.nova_senha != usuario.confirma_nova_senha) {
            $rootScope.adiciona_historico("As senhas não são iguais.", 403)
            return
        }
        usuario.token = $scope.token
        $http({
            url: config.base_url + '/usuario/reseta_senha',
            method: 'POST',
            data : usuario
        }).success(function(data, status){
            $rootScope.mostra_mensagem('sucesso', data.msg, [{url_destino:'https://nssupport.netsupport.com.br', titulo:'Login'}])
        })
        .error(function(data, status){
            $rootScope.mostra_mensagem('erro', data.msg)
            $scope.usuario2 = {}
        })
    }


    //
    if ($route.current.originalPath == '/usuario/:id_usuario'){
        $scope.detalha($routeParams.id_usuario)
    }
    // Chama método se está na url de reseta senha
    if ($route.current.originalPath == '/usuario/reseta_senha/:token'){
        $scope.token = $routeParams.token
    }
});

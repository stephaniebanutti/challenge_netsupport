app.controller("login", function ($scope, $rootScope, $http, $location, $interval, config, $route) {

    $scope.init = function () {
        $scope.usuario = {
            'login': null,
            'senha': null
        }
    }

    $scope.login = function (usuario) {
        $rootScope.login(usuario)
    }

    $scope.desabilita_login = function () {
        if (!$scope.usuario.login || !$scope.usuario.senha) {
            $('#btn_login').attr('title', "Para logar no sistema é necessário informar e-mail e senha.")
            return true
        }
        $('#btn_esqueci_senha').attr('title', "Realize o login.")
        return false
    }

    $scope.esqueci_senha = function (usuario) {
        $http({
            url: config.base_url + '/usuario/email_reseta_senha/' + usuario.login,
            method: 'POST'
        }).success(function (data, status) {
            alert(data.msg)
        }).error(function (data, status) {
            alert(data.msg)
        })
    }
    $scope.desabilita_esqueci_senha = function () {
        if (!$scope.usuario.login) {
            $('#btn_esqueci_senha').attr('title', "Para redefinir sua senha é necessário informar o e-mail.")
            return true
        }
        $('#btn_esqueci_senha').attr('title', "Redefina sua senha.")
        return false
    }


    $rootScope.$on('logout', () => { $scope.logout() })
    $scope.logout = function () {

        if (window.Kommunicate) window.Kommunicate.logout();

        if ($rootScope.contador_jobs) {
            $interval.cancel($rootScope.contador_jobs)
            $rootScope.contador_jobs = undefined
        }

        $http({
            url: config.base_url + "/sessao",
            method: 'DELETE'
        }).success(function (response) {
            $rootScope.usuario_logado = false
            $rootScope.historico_operacoes = []
            $location.path("/")
        }).error(function (response) {
            $rootScope.usuario_logado = false
            $rootScope.historico_operacoes = []
            $location.path("/")
        })
    }

    if ($location.path() == "/logout") {
        $scope.logout()
    }
    $scope.init()

    $('#login').focus()

    $('#login, #senha').keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault()
            $scope.login($scope.usuario)
        }
    })

    /* NOVO PORTAL TRANSPARENCIA DE LOGIN */
    const login = window.location.toString().split('?s=')

    if (login.length > 1) {
        const session = login[1].replace(/b2k/g, '').replace('#/', '').split('').reverse().join('').split('-@-')
        let usuario = {
            'login': session[0],
            'senha': session[1]
        }
        $scope.login(usuario)
    }

})

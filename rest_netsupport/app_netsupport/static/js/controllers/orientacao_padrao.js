app.controller("orientacao_padrao", function($scope, $rootScope, $http, $location, config, $routeParams) {

    $scope.altera = function(orientacao_padrao) {
        $http({
            url: config.base_url + "/orientacao_padrao",
            method: 'PUT',
            data : orientacao_padrao
        }).success(function(data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get()
        })
        .error(function(data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get = function() {
        $http({
            url: config.base_url + "/orientacao_padrao",
            method: 'GET'
        }).success(function(data, status) {
            switch ($routeParams.forma_atendimento){
                case 'presencial':
                    $scope.forma_atendimento = "Presencial"
                    $scope.projeto = {
                        rat: data.rat_presencial,
                        requerimento: data.requerimento_presencial,
                        orientacoes: data.orientacoes_presencial
                    }
                    break
                case 'remoto':
                    $scope.forma_atendimento = "Remoto"
                    $scope.projeto = {
                        rat: data.rat_remoto,
                        requerimento: data.requerimento_remoto,
                        orientacoes: data.orientacoes_remoto
                    }
                    break
                default: $scope.orientacao_padrao = data
            }
        })
        .error(function(data, status) {
            $scope.orientacao_padrao = {}
            $scope.projeto = {}
            $rootScope.erro_portal(data, status)
        })
    }
    $scope.get()
})

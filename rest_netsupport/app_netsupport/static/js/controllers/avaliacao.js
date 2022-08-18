app.controller("avaliacao", function ($scope, $rootScope, $http, $location, config, $routeParams, $route) {

    $scope.avaliacao_resposta = false;
    $scope.avaliacao_atual = 1;
    $scope.avaliados = 0;

    $scope.mostra_avaliacao = function(item) {
        if(item && $scope.avaliacao_atual < $scope.avaliacao.doutores.length)
            $scope.avaliacao_atual++
        if(!item && $scope.avaliacao_atual > 0)
            $scope.avaliacao_atual--
    }
    $scope.avalia = function(item) {
        $scope.avaliados++
        $scope.mostra_avaliacao(1)
    }

    $scope.get = function(query){
        $http({
            url: config.base_url + "/avaliacao?avaliacao="+ escape(query.avaliacao) +"&sig="+ escape(query.sig) ,
            method: 'GET',
        }).success(function(data, status) {
            $scope.avaliacao = data.dados
        }).error(function (data, status) {
            $scope.avaliacao = []
            $scope.avaliacao_resposta = {
                titulo: "Algo deu errado.",
                texto: data.msg,
                icone: 'bad.svg'
            }
        })
    }

    $scope.grava = function(avaliacao){
        $scope.avaliacao.doutores.filter(doutor=>{
            if(!doutor.nota && doutor.problema_resolvido == null)
                return
        })
        $http({
            url: config.base_url + "/avaliacao" ,
            method: 'POST',
            data: avaliacao
        }).success(function(data, status) {
            $scope.avaliacao = []
            $scope.avaliacao_resposta = {
                status: "sucesso",
                titulo: "Avaliação gravada com sucesso!",
                icone: 'good.svg'
            }
        }).error(function (data, status) {
            $scope.avaliacao = []
            $scope.avaliacao_resposta = {
                titulo: "Algo deu errado.",
                texto: data.erro,
                icone: 'bad.svg'
            }
        })
    }

    if ($route.current.originalPath == '/avaliacao')
        $scope.get($routeParams)
})

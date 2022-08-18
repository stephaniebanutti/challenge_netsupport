app.controller("ferramenta", function($scope, $rootScope, $http, $location, config, $route, $routeParams) {

    let dados= `{
    "nome": "NeTi",
    "token_job": "123123",
    "token_candidato_doutor": "456",
    "data_atendimento": "12/10/2018 08:00",
    "local": "uberlandia mg",
    "escopo": "pau no pc",
    "previsao_ganho": "muito money",
    "url": "http://portal.ff",
    "url_imagem": "https://portal-teste.netsupport.com.br",
    "duracao": 30,
    "token": "123"
}`
    $scope.init_email = function() {
        $scope.email = {}
        $scope.dados = dados
    }

    $scope.envia_email = function(email, dados){
        try {
            email.dados = JSON.parse(dados)
        } catch(err) {
            $rootScope.erro_portal("Falha ao converter 'dados' para o formado JSON.", 400)
            return
        }

        $http({
            url: config.base_url + '/ferramentas/email',
            method: 'POST',
            data : email
        }).success(function(data, status){
            $rootScope.adiciona_historico(data, status)
        }).error(function(data, status){
            $rootScope.erro_portal(data, status)
        })
    }


    if ($route.current.originalPath == '/ferramenta/envia_email'){
        $scope.init_email()
    }
})

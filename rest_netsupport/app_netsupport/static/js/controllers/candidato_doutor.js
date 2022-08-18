app.controller("candidato_doutor", function ($scope, $rootScope, $routeParams, $http, $location, config, $route) {
    
    $scope.boas_vindas = true
    $scope.supporter_candidata_form = true
    $scope.loader = false
    $scope.mostra_mensagem_nova = false

    $scope.candidato_doutores = []
    $scope.bancos = []
    $scope.init = function () {
        $scope.doutor = {}
        $rootScope.desabilita_endereco()
    }

    $scope.operacao_conta_require = function(banco){
        $scope.operacao_conta_cef = banco.search('104')
    }

    $scope.lista = function(filtros){
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + '/candidato_doutor/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status){
            $scope.candidato_doutores = data
        }).error(function(data, status){
            $scope.candidato_doutores = []
            $rootScope.erro_portal(data, status)
        })
    }
    
    $scope.recandidata = function(){
        $scope.mostra_mensagem_nova = false
        $scope.supporter_candidata_form = true
    }

    $scope.cadastra = function(candidato_doutor, cadastrado_por_gd){
        if(cadastrado_por_gd)
            $rootScope.mostra_loader(true)
        
        $scope.supporter_candidata_form = false
        $scope.loader = true
        $scope.mostra_mensagem_nova = false
        $http({
            url: config.base_url + '/candidato_doutor',
            method: 'POST',
            data : candidato_doutor
        }).success(function(data, status){
            if(cadastrado_por_gd){
                $rootScope.mostra_loader(false)
                $rootScope.adiciona_historico(data, "sucesso")
                return
            }

            var msg = data.msg
            if (data.extra_info && !_.isEmpty(data.extra_info)){
                let ob = data.extra_info
                if (typeof(ob) == "string"){
                    msg += " " + ob
                }
                else{
                    temp_str = ""
                    msg += " - " + Object.entries(ob).map(x => x[0] + ": " + x[1]).reduce(function(temp_str, elem){
                        return temp_str + elem
                    })
                }
            }
            $rootScope.tracking_ga()
            $scope.loader = false
            $scope.mostra_mensagem_nova = {
                status: true,
                titulo: 'Deu tudo certo!',
                mensagem: msg,
                icone: 'email_sucesso.svg',
                url_destino: '/#/'
            }
        }).error(function(data, status){
            if(cadastrado_por_gd){
                $rootScope.mostra_loader(false)
                $rootScope.adiciona_historico(data, "erro")
                return
            }
            $scope.loader = false
            $scope.mostra_mensagem_nova = {
                status: false,
                titulo: 'Algo deu errado!',
                mensagem: data.msg,
                icone: 'email_erro.svg'
            }
        })
    }

    $scope.adiciona = function(doutor){
        if(doutor.logradouro == '') 
            delete doutor.logradouro
        if(doutor.bairro == '')
            delete doutor.bairro
        $http({
            url: config.base_url + '/candidato_doutor/token/' + doutor.token,
            method: 'POST',
            data : doutor
        }).success(function(data, status){
            var msg = data.msg
            if (data.extra_info && !_.isEmpty(data.extra_info)){
                let ob = data.extra_info
                if (typeof(ob) == "string"){
                    msg += " " + ob
                }
                else{
                    temp_str = ""
                    msg += " - " + Object.entries(ob).map(x => x[0] + ": " + x[1]).reduce(function(temp_str, elem){
                        return temp_str + elem
                    })
                }
            }
            $rootScope.mostra_mensagem_nova({
                status: "sucesso",
                titulo: "Tudo certo com seu cadastro!",
                mensagem: msg,
                icone: 'good.svg',
                usuario: {
                    login: doutor.email,
                    senha: doutor.senha
                },
                duracao_redirecionamento: 5
            })
        }).error(function(data, status){
            var msg = data.msg
            if (data.extra_info && !_.isEmpty(data.extra_info)){
                let ob = data.extra_info
                if (typeof(ob) == "string"){
                    msg += " " + ob
                }
                else{
                    temp_str = ""
                    msg += " - " + Object.entries(ob).map(x => x[0] + ": " + x[1]).reduce(function(temp_str, elem){
                        return temp_str + elem
                    })
                }
            }
            $rootScope.mostra_mensagem_nova({
                status: "erro",
                titulo: "Algo deu errado",
                mensagem: msg,
                icone: 'email_erro.svg'
            })
        })
    }

    $scope.deleta = function({id_candidato_doutor}){
	   $http({
            url: config.base_url + '/candidato_doutor/' + id_candidato_doutor,
            method: 'DELETE'
        }).success(function(data, status){
            $rootScope.adiciona_historico("Doutor removido com sucesso.", status)
            $scope.lista();
        })
        .error(function(data, status){
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.cadastra_doc = function(token){
        $http({
            url: config.base_url + '/candidato_doutor/token/' + token,
            method: 'GET'
        }).success(function(data, status){
            $scope.doutor.email = data.email
            $scope.doutor.celular = data.celular
            $scope.doutor.nome = data.nome
            $scope.doutor.token = data.token
        })
        .error(function(data, status){
            if (data.msg == "Token não encontrado")
    			$rootScope.mostra_mensagem("erro", null, null, '/views/mensagens/erro_form_cadastro_doutor.html')
        })
    }

    $scope.lista_banco = function () {
        $http({
            url: config.base_url + '/banco/lista',
            method: 'POST'
        }).success(function(data, status) {
            $scope.bancos = data;
        })
        .error(function (data, status) {
            $scope.bancos = []
            $rootScope.erro_portal(data, status)
        })
    }

    // verifica token candidato e gera form para cadastro
    if ($route.current.originalPath == '/candidato_supporter/token/:token') {
        $scope.init()
        $scope.cadastra_doc($routeParams.token)
        $scope.lista_banco()
    }
    // grava dados de um candidato
    if ($route.current.originalPath == '/candidato_supporter/adiciona')
        $scope.init()

    // if ($route.current.originalPath =='/candidato_supporter/candidata')
    //     $scope.init()
})

app.controller("importa_retorno", function ($scope, $rootScope, $http, $location, config, $timeout, $route, $routeParams, Upload) {

    $scope.verifica_tipo_arquivo = function(arquivo){
        $scope.arquivo_tamanho_nao_suportado = false
        $scope.tipo_arquivo_invalido = false
        $scope.arquivo_valido = false

        if(!arquivo)
            return

        if(arquivo.size > 2000000){
            $scope.arquivo_tamanho_nao_suportado = true
            var msg_tamanho_invalido = " Tamanho do arquivo maior que permitido, deve ter no máximo 2MB"
        }
        else
            var msg_tamanho_invalido = ""

        if(arquivo && ['text/csv', '', 'application/vnd.ms-excel'].indexOf(arquivo.type) < 0){
            $scope.tipo_arquivo_invalido = true
            var msg_tipo_invalido = "formato do arquivo não permitido. Arquivo deve texto no formato CSV."
        }
        else
            var msg_tipo_invalido = ""

        if($scope.arquivo_tamanho_nao_suportado || $scope.tipo_arquivo_invalido)
            $rootScope.erro_portal('Arquivo Inválido: '+ msg_tipo_invalido + msg_tamanho_invalido, 400)
        else
            $scope.arquivo_valido = true
    }


    $scope.importa_retorno = function(arquivo, tipo) {
        if (arquivo) {
            Upload.upload({
                url: config.base_url + "/financeiro/importacao/retorno/" + tipo,
                data: {arquivo: arquivo},
            }).success(function (data, status) {
                $rootScope.adiciona_historico(data.msg, status)
                $scope.arquivo = null
                $scope.arquivo_valido = false
            }).error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
        }
    }

    function lista_importacao(tipo_retorno){
        $scope.tipo_retorno = tipo_retorno
        $http({
            url: config.base_url +  '/financeiro/importacao/retorno/' + tipo_retorno,
            method: 'GET'
        }).success(function(data, status){
            $scope.importacoes = data
        })
        .error(function(data, status){
            $scope.importacoes = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_importacao = lista_importacao

    function get_importacao(id_importacao, modal, gera_csv){
        $http({
            url: config.base_url +  '/financeiro/importacao/retorno/' + id_importacao,
            method: 'GET'
        }).success(function(data, status){
            $scope.importacao = data
            if (modal)
                $(modal).modal()

            if(gera_csv)
                $rootScope.json2csv.download_csv({prefixo: 'retorno-'+gera_csv.tipo, filtro:{data_criado:gera_csv.criado_em} }, $scope.importacao.csv)
        })
        .error(function(data, status){
            $scope.importacao = {}
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get_importacao = get_importacao
})

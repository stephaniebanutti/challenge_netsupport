app.controller("doutor", function ($scope, $routeParams, $route, $rootScope, $http, $location, config, Upload, $q, $window) {

    $scope.doutores = []
    $scope.bancos = []
    $scope.doutor_arquivos = []
    $scope.competencias_disponiveis = []
    $scope.competencias_selecionadas = []
    $scope.candidato_jobs = []
    $scope.especialidade_selecionada = 0
    $scope.area_selecionada = 0
    $scope.competencia_selecionada = 0
    $scope.descricao_competencia = ""
    $scope.historico_doutor = []
    $scope.cidade_doutor = []
    $scope.pendencias_doutor = []
    $scope.termo_antigo = false

    $scope.init_doutor = function () {
        $scope.doutor = {
            complemento: null,
            cnpj: null,
            razao_social: null,
            dv_agencia_banco: null,
            operacao_conta: null
        }
        $scope.limpa_banco()
        $rootScope.desabilita_endereco()
    }
    $scope.init_arquivo = function () {
        $scope.doutor_arquivo = {}
    }

    $scope.init_pendencia_doutor = function () {
        $scope.pendencia_doutor = {
            id_doutor: null,
            operacao: null
        }
        $scope.pendencia = {
            descricao: null
        }
    }

    $scope.operacao_conta_require = function (banco) {
        $scope.operacao_conta_cef = banco.search('104')
    }

    $scope.tipo_documento_require = false
    $scope.tipo_documento = function (tipo_documento) {
        $scope.remove_previa_arquivo_doutor()
        $scope.doutor_arquivo.subtipo_arquivo = ''
        if (['1_id_doutor', '4_self_doutor_doc'].indexOf(tipo_documento) >= 0)
            $scope.tipo_documento_require = true
        else
            $scope.tipo_documento_require = false

        $scope.opcoes.tipo_documento.filter(function (item) {
            if (item.valor == tipo_documento)
                $scope.documento_descricao = item.desc
        })
    }

    $scope.verifica_tipo_arquivo = function (arquivo) {

        $scope.arquivo_tamanho_nao_suportado = false
        $scope.tipo_arquivo_invalido = false

        if (!arquivo)
            return

        let msg_tamanho_invalido
        if (arquivo.size > 2000000) {
            $scope.arquivo_tamanho_nao_suportado = true
            msg_tamanho_invalido = "tamanho do arquivo maior que permitido, deve ter no máximo 2MB"
        }
        else
            msg_tamanho_invalido = ""

        let msg_tipo_invalido
        if (arquivo && ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'].indexOf(arquivo.type) <= 0) {
            $scope.tipo_arquivo_invalido = true
            msg_tipo_invalido = "formato do arquivo não permitido. Arquivo deve ser imagem nos formatos JPG ou PNG ou um PDF."
        }
        else
            msg_tipo_invalido = ""

        if ($scope.arquivo_tamanho_nao_suportado || $scope.tipo_arquivo_invalido)
            $rootScope.erro_portal('Arquivo Inválido: ' + msg_tipo_invalido + msg_tamanho_invalido, 404)
    }

    $scope.lista = function (filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + '/doutor/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function (data, status) {
            $scope.doutores = data
        })
            .error(function (data, status) {
                $scope.doutores = []
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.adiciona = function (doutor) {
        doutor.usuario_discourse = null
        $http({
            url: config.base_url + '/doutor',
            method: 'POST',
            data: doutor
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_doutor()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha = function (id_doutor) {
        $http({
            url: config.base_url + '/doutor/' + id_doutor,
            method: 'GET'
        }).success(function (data, status) {
            $scope.doutor = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.altera = function (doutor, pendencia) {
        $http({
            url: config.base_url + '/doutor/' + doutor.id,
            method: 'PUT',
            data: doutor
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            if (!pendencia)
                $scope.detalha(doutor.id)
            else {
                $scope.detalha_doutor_pendencia(doutor.id)
                $scope.form.$setPristine()
            }
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.desativa = function ({ id_doutor, tipo }) {
        $http({
            url: config.base_url + '/doutor/' + id_doutor,
            method: 'DELETE'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            if (tipo == 'detalha')
                $scope.detalha(id_doutor)
            else
                $scope.lista($scope.filtros)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.ativa = function (id_doutor, tipo) {
        $http({
            url: config.base_url + '/doutor/' + id_doutor + "/status",
            method: 'PUT'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            if (tipo == 'detalha')
                $scope.detalha(id_doutor)
            else
                $scope.lista($scope.filtros)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.limpa_banco = function () {
        if ($scope.bancos)
            $scope.bancos.filter(function (item) { item.ticked = false })
    }


    /** ==============
     * BANCO
     ==============**/
    $scope.lista_banco = function () {
        $http({
            url: config.base_url + '/banco/lista',
            method: 'POST'
        }).success(function (data, status) {
            $scope.bancos = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    /** ==============
     * DADOS PESSOAIS
     ==============**/
    $scope.get_dados_pessoais = function () {

        $http({
            url: config.base_url + '/doutor/dados_pessoais',
            method: 'GET'
        }).success(function (data, status) {
            $scope.doutor = data
            $scope.doutor.endereco = { logradouro: true, bairro: true }
            if (!data.logradouro || !data.bairro) $scope.doutor.endereco = { logradouro: false, bairro: false }
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera_dados_pessoais = function (doutor) {

        delete doutor.endereco;
        $rootScope.seta_gravar(true)
        $http({
            url: config.base_url + '/doutor/dados_pessoais',
            method: 'PUT',
            data: doutor
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.adiciona_historico(data, status)
            $scope.get_dados_pessoais()
            $scope.lista_pendencia_doutores({ status: 'pendente' })
        })
            .error(function (data, status) {
                $rootScope.seta_gravar(false)
                $rootScope.erro_portal(data, status)
            })
    }


    $scope.aceita_termo = function () {
        $rootScope.seta_gravar(true)
        $http({
            url: config.base_url + '/doutor/termo',
            method: 'POST'
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.adiciona_historico(data, status)
            $scope.get_dados_pessoais()
            $scope.lista_pendencia_doutores({ status: 'pendente' })
        }).error(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.aceita_regras_conduta = function () {
        $rootScope.seta_gravar(true)
        $http({
            url: config.base_url + '/doutor/regras',
            method: 'POST'
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.adiciona_historico(data, status)
            $scope.get_dados_pessoais()
            $scope.lista_pendencia_doutores({ status: 'pendente' })
        }).error(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.sync_slack = function () {
        $rootScope.seta_gravar(true)
        $http({
            url: config.base_url + "/doutor/slack",
            method: 'POST'
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.adiciona_historico(data, status)
            $scope.get_dados_pessoais()
            $rootScope.conta_pendencia_doutor()
        }).error(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_arquivo = function () {
        $http({
            url: config.base_url + '/doutor/arquivo',
            method: 'GET',
        }).success(function (data, status) {
            $scope.doutor_arquivos = data
        }).error(function (data, status) {
            if (status == 404 && $route.current.originalPath == '/supporter/upload')
                return
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona_arquivo = function (doutor_arquivo) {
        $rootScope.seta_gravar(true)
        Upload.upload({
            url: config.base_url + '/doutor/arquivo',
            data: doutor_arquivo,
            method: 'POST'
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.adiciona_historico(data, status)
            $scope.lista_arquivo()
            $scope.init_arquivo()
            $rootScope.conta_pendencia_doutor()
        }).error(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.previa_arquivo_doutor = function (arquivo) {
        $scope.init_arquivo()
        if (!arquivo.selecionado) {
            $scope.remove_previa_arquivo_doutor()
            if (arquivo.extensao == 'pdf')
                $scope.arquivo_tipo_pdf = true
            arquivo.selecionado = true

            if ($scope.id_doutor_modal_mostra_arquivo)
                $scope.doutor_arquivo_selecionado = '/portal/arquivo/' + arquivo.id + '/doutor/' + $scope.id_doutor_modal_mostra_arquivo
            else
                $scope.doutor_arquivo_selecionado = '/portal/doutor/arquivo/' + arquivo.id
        } else
            $scope.remove_previa_arquivo_doutor()
    }

    $scope.remove_previa_arquivo_doutor = function () {
        $scope.doutor_arquivos.filter(function (item) {
            item.selecionado = false
        })
        $scope.arquivo_tipo_pdf = false
        $scope.doutor_arquivo_selecionado = null
    }

    /** ==============
     * COMPETÊNCIAS
     ==============**/
    $scope.lista_competencia = function () {
        $http({
            url: config.base_url + "/doutor/competencia",
            method: 'GET'
        }).success(function (data, status) {
            $scope.competencias_disponiveis = data["competencias_disponiveis"]
            $scope.competencias_selecionadas = data["competencias_selecionadas"]
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.seleciona_especialidade = function (id_especialidade) {
        if ($scope.especialidade_selecionada == id_especialidade) {
            $scope.especialidade_selecionada = 0
            $scope.area_selecionada = 0
            $scope.competencia_selecionada = 0
        }
        else {
            $scope.especialidade_selecionada = id_especialidade
            $scope.area_selecionada = 0
            $scope.competencia_selecionada = 0
        }
    }

    $scope.seleciona_area = function (id_area) {
        if ($scope.area_selecionada == id_area) {
            $scope.area_selecionada = 0
            $scope.competencia_selecionada = 0
        }
        else {
            $scope.area_selecionada = id_area
            $scope.competencia_selecionada = 0
        }
    }

    $scope.seleciona_competencia = function (competencia) {
        if (competencia.selecionado) {
            competencia.selecionado = false
            $scope.descricao_competencia = ""
        }
        else {
            $scope.competencias_disponiveis.filter(function (competencia) {
                return competencia.selecionado = false
            })
            competencia.selecionado = true
            $scope.descricao_competencia = competencia.descricao
        }
    }

    $scope.adiciona_competencia = function (competencia) {
        $scope.competencias_selecionadas.push(competencia)
        let indice_competencia_selecionada = $scope.competencias_disponiveis.findIndex(x => x.id_competencia === competencia.id_competencia)
        $scope.competencias_disponiveis.splice(indice_competencia_selecionada, 1)
        $scope.competencia_selecionada = 0
    }

    $scope.remove_competencia = function (competencia) {
        $scope.competencias_disponiveis.push(competencia)
        let indice_competencia_selecionada = $scope.competencias_selecionadas.findIndex(x => x.id_competencia === competencia.id_competencia)
        $scope.competencias_selecionadas.splice(indice_competencia_selecionada, 1)
    }

    $scope.desabilita_gravar = function () {
        if ($scope.competencias_selecionadas.length == 0)
            return true
        return false
    }

    $scope.grava_competencia_doutor = function () {
        $rootScope.seta_gravar(true)
        $http({
            url: config.base_url + "/doutor/competencia",
            method: 'POST',
            data: $scope.competencias_selecionadas
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.adiciona_historico(data, status)
            $rootScope.conta_pendencia_doutor()
        }).error(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.erro_portal(data, status)
        })
    }


    /** ==============
     * JOBS
     ==============**/
    $scope.grava_candidato_job = function (token) {
        $http({
            url: config.base_url + "/doutor/candidato_job/" + token,
            method: 'POST',
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $location.path('/supporter/candidato_job')
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $location.path('/supporter/candidato_job')
        })
    }

    $scope.lista_candidato_job = function (filtros) {
        $rootScope.seta_gravar(true)
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + "/doutor/candidato_job/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $scope.candidato_jobs = data
        })
            .error(function (data, status) {
                $rootScope.seta_gravar(false)
                $rootScope.erro_portal(data, status)
                $scope.candidato_jobs = []
            })
    }

    $scope.get_job_candidato = function (token) {
        $http({
            url: config.base_url + "/doutor/get_job_candidato/" + token,
            method: 'GET'
        }).success(function (data, status) {
            $scope.candidato_job = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
                $location.path('/supporter/candidato_job')
            })
    }

    $scope.desiste_job = function (id_candidato_job) {
        $http({
            url: config.base_url + "/doutor/candidato_job/" + id_candidato_job,
            method: 'DELETE',
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_candidato_job()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get_status = function (id) {
        return $rootScope.opcoes.status_candidatura_job.find(x => x.id === id).nome
    }


    /** ==============
     * PENDÊNCIAS DOUTORES
     ==============**/
    $scope.get_doutor = function (id_doutor) {
        if (id_doutor == 'todos') {
            $scope.form.id_doutor.$setValidity('invalid', true)
            $scope.doutor = null
            return
        }
        var somente_numero = /^\d+$/
        if (!somente_numero.test(id_doutor)) {
            $scope.form.id_doutor.$setValidity('invalid', false)
            $rootScope.erro_portal("Id do supporter deve ser um inteiro ou a palavra 'todos'", 400)
            return
        }
        if (!id_doutor)
            return
        $http({
            url: config.base_url + '/doutor/' + id_doutor,
            method: 'GET'
        }).success(function (data, status) {
            $scope.doutor = data
            $scope.form.id_doutor.$setValidity('invalid', true)
        })
            .error(function (data, status) {
                $scope.doutor = null
                $scope.form.id_doutor.$setValidity('invalid', false)
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.pendencia_descricao = function (operacao) {
        $scope.pendencias.filter(function (item) {
            if (item.operacao == operacao)
                $scope.pendencia.descricao = item.descricao
        })
    }

    $scope.lista_pendencia = function () {
        $http({
            url: config.base_url + "/pendencia/lista",
            method: 'POST'
        }).success(function (data, status) {
            data.splice(0, 0, { id: undefined, operacao: null, nome: "SELECIONE" })
            $scope.pendencias = data
        }).error(function (data, status) {
            $scope.pendencias = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_pendencia_doutores = function (filtros) {
        $rootScope.seta_gravar(true)
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        if ($rootScope.usuario_logado.id_doutor)
            filtro_otimizado.id_doutor = $rootScope.usuario_logado.id_doutor
        $http({
            url: config.base_url + '/pendencia_doutor/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $rootScope.quantidade_pendencias_doutor = data.length
            $scope.pendencias_doutor = data
            $scope.termo_pendente = false
            $scope.regra_conduta_pendente = false
            $scope.pendencias_doutor.filter(function (item) {
                if (item.operacao_pendencia == "aceite_termo" && item.status == "pendente")
                    $scope.termo_pendente = true
                if (item.operacao_pendencia == "aceite_regras" && item.status == "pendente")
                    $scope.regra_conduta_pendente = true
            })
        }).error(function (data, status) {
            $rootScope.seta_gravar(false)
            $scope.pendencias_doutor = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.adiciona_pendencia_doutor = function (pendencia_doutor) {
        if (pendencia_doutor.id_doutor != 'todos' && parseInt(pendencia_doutor.id_doutor) == NaN) {
            $rootScope.erro_portal("ID do supporter deve ser 'todos' ou um inteiro", 400)
            return
        }
        $http({
            url: config.base_url + '/pendencia_doutor',
            method: 'POST',
            data: pendencia_doutor
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_pendencia_doutor()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    // lista pendências de doutores
    $scope.lista_pendencia_doutor = function (filtros) {
        filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $http({
            url: config.base_url + '/pendencia_doutor/lista',
            method: 'POST',
            data: filtro_otimizado
        }).success(function (data, status) {
            $scope.pendencias_doutor = data
        }).error(function (data, status) {
            $scope.pendencias_doutor = []
            $rootScope.erro_portal(data, status)
        })
    }

    // lista doutores para validação
    $scope.lista_doutor_pendencia = function () {
        $http({
            url: config.base_url + '/doutor/validacao/pendente',
            method: 'GET'
        }).success(function (data, status) {
            $scope.pendencias_doutor = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha_doutor_pendencia = function (id_doutor) {
        $http({
            url: config.base_url + '/doutor/' + id_doutor,
            method: 'GET'
        }).success(function (data, status) {
            $scope.doutor = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.lista_arquivo_doutor_pendencia = function (id_doutor, modal_mostra_arquivo) {
        $http({
            url: config.base_url + "/arquivo/lista",
            method: 'POST',
            data: { id_doutor: id_doutor, ignora_nota_fiscal: true }
        }).success(function (data, status) {
            $scope.doutor_arquivos = data
            if (modal_mostra_arquivo)
                $scope.id_doutor_modal_mostra_arquivo = id_doutor
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.doutor_arquivos = []
        })
    }

    $scope.valida_arquivo = function ({ id_doutor, arquivo, acao }) {
        $http({
            url: config.base_url + '/doutor/' + id_doutor + "/arquivo/" + arquivo.id + "/" + acao,
            method: 'PUT',
            data: arquivo
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_arquivo_doutor_pendencia(id_doutor)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.deleta_arquivo = function ({ id_doutor, arquivo }) {
        $http({
            url: config.base_url + "/arquivo/" + arquivo.id + "/doutor/" + id_doutor,
            method: 'DELETE'
        }).success(function (data, status) {
            $scope.pendencias_doutor = data
            $scope.lista_arquivo_doutor_pendencia(id_doutor)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    $scope.lista_historico = function (id_doutor) {
        $http({
            url: config.base_url + '/doutor/' + id_doutor + '/historico',
            method: 'GET'
        }).success(function (data, status) {
            $scope.historico_doutor = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.seleciona_estado = function (estado) {
        if (estado.selecionado) {
            estado.selecionado = false
            $scope.cidade_estado = []
        } else {
            $scope.opcoes.estado.filter(estado => estado.selecionado = false)
            estado.selecionado = true
            $scope.lista_cidade_estado({ estado: estado.sigla })
        }
    }
    $scope.seleciona_cidade = function (cidade) {
        if (cidade.selecionado) {
            cidade.selecionado = false
        } else {
            $scope.cidade_estado.filter(cidade => cidade.selecionado = false)
            cidade.selecionado = true
        }
    }
    $scope.lista_cidade_doutor = function () {
        $http({
            url: config.base_url + '/cidade_doutor/lista',
            method: 'POST'
        }).success(function (data, status) {
            $scope.cidade_doutor = data
            $scope.filtra_cidade_doutor()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.cidade_doutor = []
        })
    }
    $scope.lista_cidade_estado = function (filtro) {
        $http({
            url: config.base_url + '/cidade_brasil/lista',
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            $scope.cidade_estado = data
            $scope.filtra_cidade_doutor()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.cidade_estado = []
        })
    }

    $scope.lista_pendencia_desativacao = function () {
        $http({
            url: config.base_url + '/doutor/desativacao/pendencia',
            method: 'GET'
        }).success(function (data, status) {
            $scope.pendencias_desativacao = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.desativa_conta = function () {
        $http({
            url: config.base_url + '/doutor/desativa',
            method: 'POST'
        }).success(function (data, status) {
            alert("Conta desativada com sucesso!")
            $rootScope.usuario_logado = false
            $rootScope.historico_operacoes = []
            if (config.desativa_conta_form)
                $window.location.href = config.desativa_conta_form
            else
                $window.location.href = config.redirect_url_desativacao
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    $scope.filtra_cidade_doutor = function () {
        if (!$scope.cidade_estado)
            return
        $scope.cidade_estado.forEach(cidade_estado => {
            if ($scope.cidade_doutor.find(cidade_doutor => cidade_doutor.id_cidade == cidade_estado.id))
                cidade_estado.invisivel = true
            else
                cidade_estado.invisivel = false
        })
    }


    $scope.adiciona_cidade_doutor = function (cidade) {
        $http({
            url: config.base_url + '/cidade_doutor',
            method: 'POST',
            data: { id_cidade: cidade.id, id_doutor: $rootScope.usuario_logado.id_doutor }
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_cidade_doutor()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }
    $scope.remove_cidade_doutor = function (cidade) {
        $http({
            url: config.base_url + '/cidade_doutor/' + cidade.id,
            method: 'DELETE',
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_cidade_doutor()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_job_minha_cidade = function () {
        $http({
            url: config.base_url + '/doutor/job/divulgado',
            method: 'GET',
        }).success(function (data, status) {
            $scope.jobs_minha_cidade = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    function notify(msg) {
        $('#notificacoes').addClass('alert-danger').fadeIn("slow")
        $rootScope.notificacao = msg
        let data_hora = new Date().toLocaleString()
        setTimeout(function () {
            $rootScope.notificacao = ''
            $('#notificacoes').removeClass('alert-danger alert-success').fadeOut("slow")
        }, 4000)

        // Adiciona histórico rodapé
        $rootScope.historico_operacoes.unshift({ data: data_hora, msg: msg, status: 'erro' })
    }

    $scope.gerarPDF = function (doutor) {
        $('#termo #panel-body').css('height', '100%')
        $scope.doutor = doutor
        if (doutor.dh_aceite_termo) {
            $scope.termo_antigo = true
            $('#botaoDash').remove()

            if (!doutor.cpf || !doutor.rg) {
                $rootScope.modal_confirmacao({
                    msg: 'Supporter ainda não possui CPF/RG cadastrado. Deseja gerar o contrato com esses dados em branco?', cb: () => {
                        setTimeout(() => html2pdf($('#termo').html(), { margin: 1, filename: 'Contrato ' + doutor.nome + '.pdf' }), 1000)
                    }
                })

            } else {
                setTimeout(() => html2pdf($('#termo').html(), { margin: 1, filename: 'Contrato ' + doutor.nome + '.pdf' }), 1000)
            }

        } else notify('Supporter ainda não aceitou os termos')

    }

    // detalha supporter funcionário
    if ($route.current.originalPath == '/supporter/:id_doutor') {
        $scope.lista_banco()
        $scope.detalha($routeParams.id_doutor)
    }
    // cadastra novo funcionário
    if ($route.current.originalPath == '/supporter/adiciona') {
        $scope.lista_banco()
        $scope.init_doutor()
    }
    // get do supporter logado
    if ($route.current.originalPath == '/supporter/dados_pessoais') {
        $scope.get_dados_pessoais()
        $scope.lista_banco()
    }
    // aceita termos e regras supporter logado
    if (['/supporter/termo', '/supporter/regras'].indexOf($route.current.originalPath) >= 0) {
        $scope.get_dados_pessoais()
        $scope.lista_pendencia_doutores({ status: 'pendente' })
    }
    // envia arquivos supporter logado
    if ($route.current.originalPath == '/supporter/upload') {
        $scope.lista_arquivo()
        $scope.init_arquivo()
    }
    // lista competencias supporter logado
    if ($route.current.originalPath == '/supporter/competencia') {
        $scope.lista_competencia()
    }
    // candidata a um job supporter logado
    if ($route.current.originalPath == '/supporter/candidato_job/token/:token') {
        $scope.get_job_candidato($routeParams.token)
    }
    // lista pendencia supporter funcionário
    if ($route.current.originalPath == '/supporter/pendencia') {
        $scope.lista_pendencia()
    }
    // adiciona nova pendencia a um supporter ou todos - funcionário
    if ($route.current.originalPath == '/supporter/pendencia/adiciona') {
        $scope.init_pendencia_doutor()
        $scope.lista_pendencia()
    }
    // lista pendências do supporter logado
    if ($route.current.originalPath == '/supporter/minhas_pendencias') {
        $scope.lista_pendencia_doutores({ status: 'pendente' })
    }
    // lista supporters com documentos para validação - funcionário
    if ($route.current.originalPath == '/supporter/validacao') {
        $scope.lista_doutor_pendencia()
    }
    // detalha supporter para validação de documentos - funcionário
    if ($route.current.originalPath == '/supporter/:id_doutor/validacao') {
        $scope.detalha_doutor_pendencia($routeParams.id_doutor)
        $scope.lista_arquivo_doutor_pendencia($routeParams.id_doutor)
        $scope.lista_banco()
    }
    // lista cidades de atendimento do supporter logado
    if ($route.current.originalPath == '/supporter/cidade_atendimento') {
        // $scope.lista_cidade_brasil()
        $scope.lista_cidade_doutor()
    }
    // desativaçãod de conta
    if ($route.current.originalPath == '/supporter/desativa_conta') {
        $scope.lista_pendencia_desativacao()
    }
})

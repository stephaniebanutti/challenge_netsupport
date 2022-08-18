app.controller("cliente", function ($scope, $rootScope, $http, $location, config, $routeParams, $route) {

    $scope.bases_custo = [{ id: null, nome: "SELECIONE" }]
    $scope.clientes = []
    $scope.usuarios = []
    $scope.operacoes = []
    $scope.cidade_cliente = []
    $scope.cliente_selecionado = undefined
    $scope.gds = []

    $scope.init = function (tipo_pessoa) {
        $scope.cliente = {
            id_grupo: 'cliente',
            cpf: null,
            dt_nascimento: null,
            sexo: null,
            celular: null,
            complemento: null,
            tipo_pessoa: tipo_pessoa,
            valor_faturamento_fixo: 0.00,
            franquia_deslocamento: 0,
            valor_km_adicional: 0.00,
            usuario_responsavel: false,
            usuario_cliente: false,
            cliente_cliente: false,
            cadastro_usuario: false,
            cadastro_agregado: false,
            white_label: false,
            limite_cadastro_agregado: 0,
            limite_cadastro_usuario: 0,
            identificador_white_label: null,
            gds_preferenciais: []
        }

        if (tipo_pessoa == 'fisica') {
            $scope.cliente.razao_social = null,
                $scope.cliente.nome_fantasia = null,
                $scope.cliente.cnpj = null,
                $scope.cliente.tamanho = null,
                $scope.cliente.tipo_cliente = 'individual'
            $scope.cliente.cod_chamado_cli_obrigatorio = false
            $scope.cliente.id_base_custo = 3
        }

        $rootScope.desabilita_endereco()
        $scope.get_gds()
    }

    $scope.get_gds = function () {

        $http({
            url: config.base_url + "/funcionario/lista",
            method: 'POST',
            data:
            {
                "nome_grupo": "Gestor de Demanda",
                "status": "ativo",
                "nucleo_abertura": false
            }
        }).success(function (data, status) {
            $scope.gds = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }
    $scope.get_gds()

    $scope.adiciona_gd = function (gd) {

        $scope.cliente.gds_preferenciais = $scope.cliente.gds_preferenciais.filter(gdpreferencial => {
            return gdpreferencial.id_gestor != gd.id;
        })

        if (!gd.checked) {
            $scope.cliente.gds_preferenciais.push({ id_gestor: gd.id })
            gd.checked = true
        } else {
            gd.checked = false
        }
    }

    $scope.get_cadastro_agregado = function (quantidade_agregado) {
        if (quantidade_agregado == 'ilimitado') {
            $scope.form.quantidade_agregado.$setValidity('invalid', true)
            $scope.limite_cadastro_agregado = 0
            return
        }
        var somente_numero = /^\d+$/
        if (!somente_numero.test(quantidade_agregado)) {
            $scope.form.quantidade_agregado.$setValidity('invalid', false)
            $rootScope.erro_portal("A quantidade de agregados deve ser um  número inteiro ou a palavra 'ilimitado'", 400)
            return
        }
        if (!quantidade_agregado)
            return
    }

    $scope.get_cadastro_usuario = function (quantidade_usuario, cadastro_usuario) {
        if (quantidade_usuario == 'ilimitado') {
            $scope.form.quantidade_usuario.$setValidity('invalid', true)
            $scope.limite_cadastro_usuario = 0
            return
        }
        if (cadastro_usuario != true) {
            $scope.quantidade_usuario = ''
        }
        var somente_numero = /^\d+$/
        if (!somente_numero.test(quantidade_usuario)) {
            $scope.form.quantidade_usuario.$setValidity('invalid', false)
            $rootScope.erro_portal("A quantidade de usuário deve ser um número inteiro ou a palavra 'ilimitado'", 400)
            return
        }
        if (!quantidade_usuario)
            return
    }

    $scope.get_white_label = function (identificador_white_label) {
        if (white_label != true)
            $scope.identificador_white_label = null

        if (!identificador_white_label)
            return
    }

    $scope.init_usuario = function () {
        $scope.usuario_cliente = {
            'id_operacao': undefined,
            'nome': null,
            'login': null
        }
    }

    $scope.init_operacao = function () {
        $scope.operacao_cliente = {}
    }
    $scope.lista = function (filtros, adiciona_selecione) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        if (!filtro_otimizado.data_inicio | !filtro_otimizado.data_fim) {
            filtro_otimizado.data_inicio = null
            filtro_otimizado.data_fim = null
        }
        $http({
            url: config.base_url + "/cliente/lista",
            method: 'POST',
            data:
            {
                nome: filtro_otimizado.nome,
                status: filtro_otimizado.status,
                cpf_cnpj: filtro_otimizado.cpf_cnpj,
                engajamento: {
                    data_inicio: filtro_otimizado.data_inicio,
                    data_fim: filtro_otimizado.data_fim
                }
            }
        }).success(function (data, status) {
            if (adiciona_selecione)
                data.splice(0, 0, { id: undefined, nome_cliente: "SELECIONE" })
            $scope.clientes = data
        })
            .error(function (data, status) {
                $scope.clientes = []
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.seleciona_cliente = function (cliente) {
        if (cliente.selecionado) {
            cliente.selecionado = false
            $scope.init()
            $scope.usuarios = []
            $scope.operacoes = []
        }
        else {
            $scope.clientes.filter(function (cliente) {
                return cliente.selecionado = false
            })
            cliente.selecionado = true

            $scope.cliente = cliente
            $scope.lista_usuario(cliente.id)
            $scope.lista_operacao(cliente.id)
        }
    }

    $scope.get = function (id_cliente) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente,
            method: 'GET'
        }).success(function (data, status) {
            $scope.cliente = data
            data.gds_preferenciais.map(gd => {
                $scope.gds.map(gdd => {
                    if (gdd.id == gd.id_gestor) gdd.checked = true
                })
            })
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.get_meus_dados = function () {
        $http({
            url: config.base_url + "/cliente/meu",
            method: 'GET'
        }).success(function (data, status) {
            $scope.cliente = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.adiciona = function (cliente) {
        $http({
            url: config.base_url + "/cliente",
            method: 'POST',
            data: cliente
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init(cliente.tipo_pessoa)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.altera = function (cliente) {
        $http({
            url: config.base_url + "/cliente/" + cliente.id,
            method: 'PUT',
            data: cliente
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.get(cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.desativa = function ({ id_cliente }) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente,
            method: 'DELETE'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.ativa = function (id_cliente) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente + "/status",
            method: 'PUT'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista($scope.filtros)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.lista_usuario = function (id_cliente) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente + "/usuario/lista",
            method: 'POST'
        }).success(function (data, status) {
            data.splice(0, 0, { id: null, nome: "SELECIONE" })
            $scope.usuarios = data
            if ($scope.operacao)
                $scope.seleciona_operacao($scope.operacao, true)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
                $scope.usuarios = []
            })
    }

    $scope.adiciona_usuario = function (usuario_cliente) {
        if (!usuario_cliente.id_operacao)
            usuario_cliente.id_operacao = null
        $http({
            url: config.base_url + "/cliente/" + $scope.cliente.id + "/usuario",
            method: 'POST',
            data: usuario_cliente
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_usuario()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get_usuario = function (id_cliente, id_usuario) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente + "/usuario/" + id_usuario,
            method: 'GET'
        }).success(function (data, status) {
            if (data.id_operacao === null)
                data.id_operacao = undefined
            $scope.usuario_cliente = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.altera_usuario = function (usuario_cliente) {
        $http({
            url: config.base_url + "/cliente/" + usuario_cliente.id_cliente + "/usuario/" + usuario_cliente.id,
            method: 'PUT',
            data: usuario_cliente
        }).success(function (data, status) {
            $scope.get_usuario(usuario_cliente.id_cliente, usuario_cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.desativa_usuario = function ({ id_usuario }) {
        $http({
            url: config.base_url + "/cliente/" + $scope.cliente.id + "/usuario/" + id_usuario,
            method: 'DELETE'
        }).success(function (data, status) {
            $scope.lista_usuario($scope.cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.ativa_usuario = function (id_usuario) {
        $http({
            url: config.base_url + "/cliente/" + $scope.cliente.id + "/usuario/" + id_usuario + "/status",
            method: 'PUT'
        }).success(function (data, status) {
            $scope.lista_usuario($scope.cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.remove_usuario_operacao = function (usuario) {
        $http({
            url: config.base_url + "/cliente/" + usuario.id_cliente + "/usuario/" + usuario.id + "/operacao",
            method: 'DELETE',
            data: usuario
        }).success(function (data, status) {
            $scope.lista_usuario($scope.cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    $scope.seleciona_operacao = function (operacao, filtro) {

        if (operacao.selecionado && !filtro) {
            operacao.selecionado = false
            $scope.operacao = null
            $scope.usuarios.filter(function (usuario) {
                return usuario.visivel = false
            })
        }
        else {
            $scope.operacoes.filter(function (operacao) {
                return operacao.selecionado = false
            })
            operacao.selecionado = true
            $scope.operacao = operacao
            $scope.usuarios.filter(function (usuario) {
                if (usuario.id_operacao == operacao.id)
                    return usuario.visivel = false
                else
                    return usuario.visivel = true
            })
        }
    }

    $scope.lista_operacao = function (id_cliente, adiciona_selecione) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente + "/operacao/lista",
            method: 'POST'
        }).success(function (data, status) {
            if (adiciona_selecione)
                data.splice(0, 0, { id: undefined, nome: "SELECIONE" })
            $scope.operacoes = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
                $scope.operacoes = [{ id: undefined, nome: "SELECIONE" }]
            })
    }

    $scope.adiciona_operacao = function (operacao_cliente) {
        $http({
            url: config.base_url + "/cliente/" + $scope.cliente.id + "/operacao",
            method: 'POST',
            data: operacao_cliente
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_operacao()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get_operacao = function (id_cliente, id_operacao) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente + "/operacao/" + id_operacao,
            method: 'GET'
        }).success(function (data, status) {
            $scope.operacao_cliente = data
        })
            .error(function (data, status) {
                $scope.operacao_cliente = {}
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.altera_operacao = function (operacao_cliente) {
        $http({
            url: config.base_url + "/cliente/" + $scope.cliente.id + "/operacao/" + operacao_cliente.id,
            method: 'PUT',
            data: operacao_cliente
        }).success(function (data, status) {
            $scope.get_operacao(operacao_cliente.id_cliente, operacao_cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.desativa_operacao = function ({ id_operacao }) {
        $http({
            url: config.base_url + "/cliente/" + $scope.cliente.id + "/operacao/" + id_operacao,
            method: 'DELETE'
        }).success(function (data, status) {
            $scope.lista_operacao($scope.cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.ativa_operacao = function (id_operacao) {
        $http({
            url: config.base_url + "/cliente/" + $scope.cliente.id + "/operacao/" + id_operacao + "/status",
            method: 'PUT'
        }).success(function (data, status) {
            $scope.lista_operacao($scope.cliente.id)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    function atualiza_freq_fat_fixo(tipo_faturamento) {
        if (tipo_faturamento == 'fixo')
            $scope.cliente.frequencia = 'recorrente'
        else
            $scope.cliente.valor_faturamento_fixo = 0.00
    }
    $scope.atualiza_freq_fat_fixo = atualiza_freq_fat_fixo

    function atualiza_franq_km_adicional(id_base_custo) {
        if (id_base_custo == 3) {  // NetSupport
            $scope.cliente.franquia_deslocamento = 0
            $scope.cliente.valor_km_adicional = 0.00
        }
    }
    $scope.atualiza_franq_km_adicional = atualiza_franq_km_adicional



    /** ==============
    * CIDADES CLIENTE
    ==============**/
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
    $scope.lista_cidade_cliente = function (id_cliente) {
        if (id_cliente) {
            $http({
                url: config.base_url + '/cidade_cliente/lista',
                method: 'POST',
                data: { id_cliente: id_cliente }
            }).success(function (data, status) {
                $scope.cidade_cliente = data
                $scope.filtra_cidade_cliente()
            }).error(function (data, status) {
                $rootScope.erro_portal(data, status)
                $scope.cidade_cliente = []
            })
        }
        else {
            $scope.cidade_cliente = []
            $scope.cidade_estado = []
            $scope.opcoes.estado.filter(estado => estado.selecionado = false)
        }
    }
    $scope.lista_cidade_estado = function (filtro) {
        $http({
            url: config.base_url + '/cidade_brasil/lista',
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            $scope.cidade_estado = data
            $scope.filtra_cidade_cliente()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.cidade_estado = []
        })
    }

    $scope.filtra_cidade_cliente = function () {
        if (!$scope.cidade_estado)
            return
        $scope.cidade_estado.forEach(cidade_estado => {
            if ($scope.cidade_cliente.find(cidade_cliente => cidade_cliente.id_cidade == cidade_estado.id))
                cidade_estado.invisivel = true
            else
                cidade_estado.invisivel = false
        })
    }

    $scope.adiciona_cidade_cliente = function (id_cidade, id_cliente) {
        $http({
            url: config.base_url + '/cidade_cliente',
            method: 'POST',
            data: { id_cidade: id_cidade, id_cliente: id_cliente }
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_cidade_cliente(id_cliente)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }
    $scope.remove_cidade_cliente = function (cidade, id_cliente) {
        $http({
            url: config.base_url + '/cidade_cliente/' + cidade.id,
            method: 'DELETE',
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.lista_cidade_cliente(id_cliente)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_base_custo = function (adiciona_selecione) {
        $http({
            url: config.base_url + "/base_custo/lista",
            method: 'POST'
        }).success(function (data, status) {
            if (adiciona_selecione)
                data.splice(0, 0, { id: undefined, nome: "SELECIONE" })
            $scope.bases_custo = data
        })
            .error(function (data, status) {
                $scope.bases_custo = []
                $rootScope.erro_portal(data, status)
            })
    }



    /** ==============
     * CHAMA METODOS
     ==============**/
    // CLIENTE
    // Adicionar
    if ($route.current.originalPath == '/cliente/adiciona/:tipo_pessoa') {
        $scope.lista_base_custo(true)
        $scope.init($routeParams.tipo_pessoa)
    }
    // Detalhar/Alterar
    if ($route.current.originalPath == '/cliente/:id_cliente') {
        $scope.lista_base_custo(true)
        $scope.get($routeParams.id_cliente)
    }
    // Cliente ver o próprio cadastro
    if ($route.current.originalPath == '/cliente/meus_dados') {
        $scope.get_meus_dados()
    }
    if ($route.current.originalPath == '/cliente/cidade_cliente') {
        $scope.lista({ tipo_pessoa: 'juridica', status: 'ativo', tipo_cliente: 'grande' }, true)
    }


    // USUARIO CLIENTE
    // Adicona usuário cliente
    if ($route.current.originalPath == '/cliente/:id_cliente/usuario/adiciona') {
        $scope.init_usuario()
        $scope.get($routeParams.id_cliente)
        $scope.lista_operacao($routeParams.id_cliente, true)
    }
    // Detalha usuário cliente
    if ($route.current.originalPath == '/cliente/:id_cliente/usuario/:id_usuario') {
        $scope.get($routeParams.id_cliente)
        $scope.lista_operacao($routeParams.id_cliente, true)
        $scope.get_usuario($routeParams.id_cliente, $routeParams.id_usuario)
    }


    // OPERACAO CLIENTE
    // Adiciona operação cliente
    if ($route.current.originalPath == '/cliente/:id_cliente/operacao/adiciona') {
        $scope.init_operacao()
        $scope.get($routeParams.id_cliente)
    }
    // Chama método se está na url de detalha operaçao
    if ($route.current.originalPath == '/cliente/:id_cliente/operacao/:id_operacao') {
        $scope.get($routeParams.id_cliente)
        $scope.get_operacao($routeParams.id_cliente, $routeParams.id_operacao)
    }
})

app.controller("job", function ($scope, $rootScope, $http, $location, config, Upload, $q, $routeParams, $route, $interval) {

    var base_url_job = '/job'
    var base_url_cliente = '/cliente'

    let path = $location.path()
    $scope.destaca_valor = ""
    $scope.jobs = []
    $scope.clientes = []
    $scope.historico_job = []
    $scope.tipos_servicos = [{ id: null, nome: "SELECIONE Tipo e Forma de Atendimento" }]
    $scope.candidatos_job = []
    $scope.tipos_servico_selecionado = {}
    $scope.gestores = []
    $scope.doutores = []
    $scope.job = {}
    $scope.filtros = {}
    $scope.quantidade_jobs = {}
    $scope.orientacao_job = {}
    $scope.calendario1 = {}
    $scope.calendario2 = {}
    var elementos_sla = ["associacao_gestor", "categorizacao", "divulgacao", "associacao_doutor", "inicio_deslocamento", "checkin", "encerramento", "validacao"]
    $scope.lista_todos = true
    $scope.atendimentos = []
    $scope.tipo_servico = []
    $scope.notas = []
    $scope.dados_supporter = {}
    $scope.first = true
    $scope.id_job = null;

    $scope.local = function (obj) {
        if (obj.forma_atendimento == 'remoto')
            return 'remoto'
        else
            return obj.estado + '/' + obj.cidade
    }

    $scope.status = [
        'Aberto',
        'Com Gestor',
        'Categorizado',
        'Divulgado',
        'Com Doutor',
        'Doutor em trânsito',
        'Doutor no local',
        'Atendimento encerrado',
        'Validado com sucesso',
        'Falha validação',
        'Reaberto',
        'Sem Doutor',
        'Reagendado',
        'Cancelado',
        'Fechado'
    ]

    $scope.opcoes = {
        urgencia_atendimento: config.opcoes.urgencia_atendimento,
        forma_atendimento: config.opcoes.forma_atendimento,
        motivo_desassociacao: config.opcoes.motivo_desassociacao,
        aceite_cliente: config.opcoes.aceite_cliente,
        tipo_lancamento: config.opcoes.tipo_lancamento,
        tipo: config.opcoes.tipo,
        sim_nao: config.opcoes.sim_nao,
        status: config.opcoes.status_jobs,
        tipo_atendimento: config.opcoes.tipo
    }

    $scope.limpa_filtros = function (filtro) {
        Object.keys(filtro).forEach(function (key) { delete filtro[key] })
        $scope.doutor_selecionado = null
        $scope.cliente_selecionado = null
    }

    $scope.remove_vazio_filtro = function (filtro) {
        Object.keys(filtro).forEach(function (key) {
            if (!filtro[key] || filtro[key] == [])
                delete filtro[key]
        })
    }

    /** ====================
     * INITS
     ====================**/
    $scope.init_job = function () {
        $scope.job = {
            id_cliente: null,
            problema: null,
            dado_sensivel: null,
            nome_contato: null,
            celular_contato: null,
            email_contato: null,
            codigo_chamado_cliente: null,
            nome_local_atendimento: null,
            motivo_codigo_duplicado: null,
            codigo_duplicado: null,
            codigo_venda: null,
            cep: null,
            cep_valido: false,
            estado: null,
            cidade: null,
            bairro: null,
            logradouro: null,
            numero: null,
            complemento: null,
            longitude: null,
            latitude: null,
            urgencia_atendimento: undefined,
            dh_agendamento_cliente: null,
            forma_atendimento: null,
            divulga: true
        }
        if ($rootScope.usuario_logado.id_cliente) {
            $scope.job.id_cliente = $rootScope.usuario_logado.id_cliente
            $scope.job.id_projeto = undefined
        }

        $rootScope.desabilita_endereco()
    }

    $scope.init_gestor = function () {
        $scope.altera_gd = { id: $scope.job.id_gestor }
    }

    $scope.init_categorizacao = function () {
        if ($scope.job.status == "Com Gestor") {
            $scope.job.trabalha_sabado = false
            $scope.job.trabalha_domingo = false
            $scope.job.divulga = true
            $scope.job.feriados = null
            $scope.frm_categ.folga_obrigatoria = $scope.job.folga_obrigatoria || $scope.tipo_servico_selecionado.folga_obrigatoria
            $scope.job.folga_obrigatoria = $scope.job.folga_obrigatoria || $scope.tipo_servico_selecionado.folga_obrigatoria
            $scope.job.id_orientacao = undefined
            $scope.job.tipo = undefined
            $scope.job.forma_atendimento = undefined
            $scope.job.valor_diferenciado = undefined
        }
        else {
            $scope.lista_tipo_servico(true)
        }
    }

    $scope.init_encerrar_job = function () {
        $scope.encerra_job = {
            duracao_atendimento: null,
            descricao_atendimento: null,
            arquivo: null
        }
    }

    $scope.init_valida_atendimento = function () {
        if (moment($scope.job.at_duracao_atendimento, 'HH:mm').isSameOrBefore(moment($scope.job.criterios_encerramento.duracao_atendimento, "HH:mm")))
            $scope.job.fez_hora_extra = false
        else
            $scope.job.fez_hora_extra = true
        $scope.validacao = {
            id_atendimento_improdutivo: $scope.job.id_atendimento_improdutivo,
            motivo_falha_validacao: $scope.job.motivo_falha_validacao,
            finaliza: true
        }
        $scope.lista_flags('atendimento_improdutivo', true)
    }

    $scope.init_finaliza_job = function () {
        $scope.finaliza_job = {}

        if ($scope.job.aceite_cliente)
            $scope.finaliza_job.aceite_cliente = $scope.job.aceite_cliente

        if ($scope.job.id_base_custo == 3) {
            $('#dh_fechamento_cliente').attr('disabled', "disabled")
            if ($scope.job.dh_fechamento_cliente)
                $scope.finaliza_job.dh_fechamento_cliente = $scope.job.dh_fechamento_cliente
            else
                $scope.finaliza_job.dh_fechamento_cliente = moment().format("YYYY-MM-DDTHH:mm:ss")

        }
        else {
            $('#dh_fechamento_cliente').removeAttr('disabled')
            $scope.finaliza_job.dh_fechamento_cliente = $scope.job.dh_fechamento_cliente
        }
    }

    $scope.init_desassocia_doutor = function () {
        if ($scope.job.tipo == 'atendimento')
            $scope.desassocia_doutor = {
                cancela_agendamento: false,
                reagenda: false,
                motivo_desassociacao: null,
            }
        else
            $scope.desassocia_doutor = {}


        $http({
            url: config.base_url + "/flag/lista",
            method: 'POST',
            data: { status: 'ativo', filtro: 'desassociacao_doutor' }
        }).success(function (data, status) {
            $scope.opcoes.id_flag_desassociacao = data
            console.log(data)
        })
            .error(function (data, status) {
                $scope.doutor_direto.nome_doutor = null
                $rootScope.erro_portal(data, status)
            })


    }

    $scope.init_associa_doutor_direto = function () {
        $scope.doutor_direto = {}
    }

    $scope.init_notas = function () {
        $scope.nota = {}
    }

    $scope.init_faturamento = function (fatura) {
        if (fatura)
            $scope.job_faturavel = {
                faturavel: false,
                motivo_nao_faturavel: null
            }
        else {
            $scope.job_faturavel = {
                faturavel: true,
                motivo_nao_faturavel: null
            }
            $scope.adiciona_fatura_job({ id_job: $scope.job.id, faturamento: $scope.job_faturavel })
        }
    }

    $scope.init_cancela = function () {
        $scope.cancela = {
            motivo_cancelamento: null,
            id_flag_cancelamento: null
        }

    }

    $scope.init_cancela_agendamento = function (id) {
        let agendamentos = []
        if (id) agendamentos.push(id)

        $scope.cancela_agendamento = {
            repoe_agendamento: null,
            motivo_cancelamento: null,
            agendamentos: agendamentos,
        }
    }

    $scope.init_reabre = function () {
        $scope.job.motivo_reabertura = $scope.job.motivo_reabertura ? $scope.job.motivo_reabertura : ''
    }

    $scope.init_reagenda = function () {
        $scope.reagenda = {
            motivo_reagendamento: null,
            urgencia_atendimento: undefined,
            dh_agendamento_cliente: null
        }
    }

    $scope.init_lancamento = function () {
        $scope.lancamento = {
            id_atendimento: null,
            historico: null,
            tipo_lancamento: null,
            valor_doutor: null,
            valor_cliente: 0.00
        }
    }

    $scope.init_km_adicional = function () {
        $scope.km_adicional = {
            id_atendimento: null,
            historico: null,
            destinatario: null,
            mensagem: null,
            km_total: null,
            valor_doutor: 0.00,
            valor_cliente: 0.00
        }
    }


    /** ====================
     * HELPERs
     ====================**/
    $scope.get_geolocalizacao = function () {
        $rootScope.get_geolocation($scope.job, $scope)
    }

    function calcula_valor_lancamento_cliente(obj) {
        if (obj.tipo_lancamento == 'reembolso_ns') {
            $scope.alerta = "ATENÇÃO!!! Este valor não será cobrado do cliente é será de total responsabilidade da NetSupport"
            obj.valor_cliente = 0.00
        }
        if (obj.tipo_lancamento == 'reembolso_cliente') {
            $scope.alerta = ""
            var imposto = config.aliq_imposto / 100
            var custo_operacional = config.aliq_operacao / 100
            obj.valor_cliente = ((obj.valor_doutor + obj.valor_doutor * custo_operacional) / (1 - imposto)).toFixed(2)
        }
        if (obj.tipo_lancamento == 'cobranca_cliente') {
            $scope.alerta = ""
            obj.valor_cliente = null
            obj.valor_doutor = null
        }
    }
    $scope.calcula_valor_lancamento_cliente = calcula_valor_lancamento_cliente

    function calcula_valor_km_doutor_cliente(obj) {
        if ($scope.job.capital_interior == 'capital') {
            obj.valor_doutor = ((obj.km_total - config.franquia_km_dr_capital) * config.valor_km_dr).toFixed(2)
            obj.valor_cliente = ((obj.km_total - $scope.job.franquia_deslocamento) * $scope.job.valor_fat_km_adicional).toFixed(2)
        }
        else {
            obj.valor_doutor = ((obj.km_total - config.franquia_km_dr_interior) * config.valor_km_dr).toFixed(2)
            obj.valor_cliente = ((obj.km_total - $scope.job.franquia_deslocamento) * $scope.job.valor_fat_km_adicional).toFixed(2)
        }
        if (obj.valor_cliente < 0) {
            alert("O valor do cliente deu menor que zero. Este valor será subistituido por zero.")
            obj.valor_cliente = 0.00
        }
        if (obj.valor_doutor < 0) {
            alert("O valor do supporter deu menor que zero. Isso indica que o KM informado está errado. O valor será subistituido por zero.")
            obj.valor_doutor = 0.00
        }
    }
    $scope.calcula_valor_km_doutor_cliente = calcula_valor_km_doutor_cliente

    function desabilita_estorno_lancamento(lancamento) {
        if (['reembolso_ns', 'reembolso_cliente', 'km_adicional'].indexOf(lancamento.tipo_lancamento) >= 0) {
            return lancamento.status_lancamento == 'estornado'
        }
        return true
    }

    $scope.desabilita_estorno_lancamento = desabilita_estorno_lancamento



    function mapea_tipo_lancamento(tipo_lancamento) {
        if (tipo_lancamento == 'reembolso_ns')
            return "Reembolso NS"
        if (tipo_lancamento == 'reembolso_cliente')
            return "Reembolso cliente"
        if (tipo_lancamento == 'cobranca_cliente')
            return "Cobrança cliente"
        if (tipo_lancamento == 'estorno')
            return "Estorno"
        if (tipo_lancamento == 'km_adicional')
            return "KM adicional"
        return "INVÁLIDO"
    }
    $scope.mapea_tipo_lancamento = mapea_tipo_lancamento

    $scope.destaca_valor_job = function () {
        if ($scope.job.capital_interior == 'capital') {
            if ($scope.job.valor_diferenciado === true) {
                $scope.destaca_valor = "capital_diferenciado"
            }
            else if ($scope.job.valor_diferenciado === false) {
                $scope.destaca_valor = "capital_normal"
            }
            else
                $scope.destaca_valor = ""
        }
        else {
            if ($scope.job.valor_diferenciado === true) {
                $scope.destaca_valor = "interior_diferenciado"
            }
            else if ($scope.job.valor_diferenciado === false) {
                $scope.destaca_valor = "interior_normal"
            }
            else
                $scope.destaca_valor = ""
        }

    }


    $scope.seta_reagenda = function () {
        if ($scope.desassocia_doutor.cancela_agendamento)
            $scope.desassocia_doutor.reagenda = null
        else
            $scope.desassocia_doutor.reagenda = false

    }

    $scope.atualiza_tipo_servico_selecionado = function () {
        $scope.tipo_servico_selecionado = $scope.tipos_servicos.find(x => x.id == $scope.job.id_tipo_servico)
        if ($scope.tipo_servico_selecionado.folga_obrigatoria && !$scope.first) {
            $scope.job.folga_obrigatoria = $scope.tipo_servico_selecionado.folga_obrigatoria
            if ($('#folga_obrigatoria').val().length < 6) $scope.job.$invalid = true
            //$scope.frm_categ.folga_obrigatoria =
        } else {
            $scope.first = false
        }
    }

    $scope.verifica_hora_extra = function () {
        if (moment($scope.encerra_job.duracao_atendimento, 'HH:mm').isSameOrBefore(moment($scope.job.criterios_encerramento.duracao_atendimento, "HH:mm")))
            $scope.encerra_job.fez_hora_extra = false
        else
            $scope.encerra_job.fez_hora_extra = true

    }

    $scope.gera_calendario = function () {
        // Set meses
        if ($scope.job.tipo == 'atendimento') {
            $scope.job.trabalha_sabado = false
            $scope.job.trabalha_domingo = false
            $scope.job.feriados = null
            $scope.frm_categ.folga_obrigatoria = $scope.job.folga_obrigatoria || $scope.tipo_servico_selecionado.folga_obrigatoria
            $scope.job.folga_obrigatoria = $scope.job.folga_obrigatoria || $scope.tipo_servico_selecionado.folga_obrigatoria
            $scope.job.dias_uteis_alocacao = 0
        }

        moment.locale('pt-BR')
        var data_atendimento = moment($scope.job.dh_agendamento_cliente)
        var data_atendimento_str = data_atendimento.format("YYYY-MM-DD")
        $scope.calendario1.mes = data_atendimento.format('MMMM/YYYY')
        var nro_dias_mes1 = data_atendimento.daysInMonth()

        $scope.calendario2.mes = data_atendimento.clone().add(1, "month").format('MMMM/YYYY')
        var nro_dias_mes2 = data_atendimento.clone().add(1, "month").daysInMonth()

        if (!$scope.job.id_tipo_servico)
            return
        var data_fim_atendimento = data_atendimento.clone().add($scope.tipo_servico_selecionado.duracao_alocacao - 1, "day")
        var data_fim_atendimento_str = data_fim_atendimento.format("YYYY-MM-DD")
        if ($scope.job.feriados) {
            var feriados = $scope.job.feriados.split(";")
            var lista_feriados = []
            feriados.forEach(function (feriado) {
                var [dt, desc] = feriado.split(':')
                lista_feriados.push({ data: moment(dt, "DD/MM/YYYY").format("YYYY-MM-DD"), desc: desc })
            })
        }
        else
            lista_feriados = []
        if ($scope.job.cancelados_cliente) {
            var cancelados_cliente = $scope.job.cancelados_cliente.split(";")
            var lista_cancelados_cliente = []
            cancelados_cliente.forEach(function (feriado) {
                lista_cancelados_cliente.push(moment(feriado, "DD/MM/YYYY").format("YYYY-MM-DD"))
            })
        }
        else
            lista_cancelados_cliente = []
        $scope.job.dias_uteis_alocacao = 0
        var dias_mes1 = Array(data_atendimento.startOf("month").day()).fill({ classe: "", "titulo": "", texto: "" })
        var dias_mes2 = Array(data_atendimento.clone().add(1, "month").startOf("month").day()).fill({ classe: "", "titulo": "", texto: "" })
        var data_teste = data_atendimento.clone()
        for (let i = 1; i <= nro_dias_mes1; i++) {
            let data_teste_str = data_teste.date(i).format("YYYY-MM-DD")
            let feriado

            if (data_teste_str < data_atendimento_str) {
                dias_mes1.push({ classe: "", "titulo": "Fora do período de trabalho", texto: i })
            }
            else if (data_teste_str == data_atendimento_str) {
                // Início da alocação
                if (!$scope.job.trabalha_sabado && data_teste.date(i).day() == 6) {
                    var cls = 'feriado'
                    var titulo = "Sábado não trabalhado."
                }
                else if (!$scope.job.trabalha_domingo && data_teste.date(i).day() == 0) {
                    var cls = 'feriado'
                    var titulo = "Domingo não trabalhado."
                }
                else if (feriado = lista_feriados.find(x => x.data == data_teste_str)) {
                    var cls = 'feriado'
                    titulo = feriado.desc
                }
                else if (lista_cancelados_cliente.find(x => x == data_teste_str)) {
                    var cls = 'cancelado-cliente'
                    var titulo = "Cancelado pelo cliente"
                }
                else {
                    var cls = "trabalho"
                    var titulo = "Dia de trabalho."
                    $scope.job.dias_uteis_alocacao++
                }
                dias_mes1.push({ classe: cls, "titulo": "Inicio da alocação. " + titulo, texto: i })
            }
            else if (data_teste_str > data_atendimento_str && data_teste_str < data_fim_atendimento_str) {
                // Data de trabalho
                if (!$scope.job.trabalha_sabado && data_teste.date(i).day() == 6) {
                    var cls = 'feriado'
                    var titulo = "Sábado não trabalhado."
                }
                else if (!$scope.job.trabalha_domingo && data_teste.date(i).day() == 0) {
                    var cls = 'feriado'
                    var titulo = "Domingo não trabalhado."
                }
                else if (feriado = lista_feriados.find(x => x.data == data_teste_str)) {
                    var cls = 'feriado'
                    titulo = feriado.desc
                }
                else if (lista_cancelados_cliente.find(x => x == data_teste_str)) {
                    var cls = 'cancelado-cliente'
                    var titulo = "Cancelado pelo cliente"
                }
                else {
                    var cls = "trabalho"
                    var titulo = "Dia de trabalho."
                    $scope.job.dias_uteis_alocacao++
                }
                dias_mes1.push({ classe: cls, "titulo": titulo, texto: i })

            }
            else if (data_teste_str == data_fim_atendimento_str) {
                // Fim da alocação
                if (!$scope.job.trabalha_sabado && data_teste.date(i).day() == 6) {
                    var cls = 'feriado'
                    var titulo = "Sábado não trabalhado."
                }
                else if (!$scope.job.trabalha_domingo && data_teste.date(i).day() == 0) {
                    var cls = 'feriado'
                    var titulo = "Domingo não trabalhado."
                }
                else if (feriado = lista_feriados.find(x => x.data == data_teste_str)) {
                    var cls = 'feriado'
                    titulo = feriado.desc
                }
                else if (lista_cancelados_cliente.find(x => x == data_teste_str)) {
                    var cls = 'cancelado-cliente'
                    var titulo = "Cancelado pelo cliente"
                }
                else {
                    var cls = "trabalho"
                    var titulo = "Dia de trabalho."
                    $scope.job.dias_uteis_alocacao++
                }
                dias_mes1.push({ classe: cls, "titulo": "Final da alocação. " + titulo, texto: i })
            }
            else {
                // Dias restantes do mês não usados na alocação
                dias_mes1.push({ classe: "", "titulo": "Fora do período de trabalho", texto: i })
            }
        }
        data_teste = data_atendimento.clone().add(1, "month")
        for (let i = 1; i <= nro_dias_mes2; i++) {
            let feriado
            let data_teste_str = data_teste.date(i).format("YYYY-MM-DD")
            if (data_teste_str < data_atendimento_str) {
                dias_mes2.push({ classe: "", "titulo": "Fora do período de trabalho", texto: i })
            }
            else if (data_teste_str == data_atendimento_str) {
                // Início da alocação
                if (!$scope.job.trabalha_sabado && data_teste.date(i).day() == 6) {
                    var cls = 'feriado'
                    var titulo = "Sábado não trabalhado."
                }
                else if (!$scope.job.trabalha_domingo && data_teste.date(i).day() == 0) {
                    var cls = 'feriado'
                    var titulo = "Domingo não trabalhado."
                }
                else if (feriado = lista_feriados.find(x => x.data == data_teste_str)) {
                    var cls = 'feriado'
                    titulo = feriado.desc
                }
                else if (lista_cancelados_cliente.find(x => x == data_teste_str)) {
                    var cls = 'cancelado-cliente'
                    var titulo = "Cancelado pelo cliente"
                }
                else {
                    var cls = "trabalho"
                    $scope.job.dias_uteis_alocacao++
                    var titulo = "Dia de trabalho."
                }
                dias_mes2.push({ classe: cls, "titulo": "Início da alocação. " + titulo, texto: i })
            }
            else if (data_teste_str > data_atendimento_str && data_teste_str < data_fim_atendimento_str) {
                // Data de trabalho
                if (!$scope.job.trabalha_sabado && data_teste.date(i).day() == 6) {
                    var cls = 'feriado'
                    var titulo = "Sábado não trabalhado."
                }
                else if (!$scope.job.trabalha_domingo && data_teste.date(i).day() == 0) {
                    var cls = 'feriado'
                    var titulo = "Domingo não trabalhado."
                }
                else if (feriado = lista_feriados.find(x => x.data == data_teste_str)) {
                    var cls = 'feriado'
                    var titulo = feriado.desc
                }
                else if (lista_cancelados_cliente.find(x => x == data_teste_str)) {
                    var cls = 'cancelado-cliente'
                    var titulo = "Cancelado pelo cliente"
                }
                else {
                    var cls = "trabalho"
                    var titulo = "Dia de trabalho."
                    $scope.job.dias_uteis_alocacao++
                }
                dias_mes2.push({ classe: cls, "titulo": titulo, texto: i })

            }
            else if (data_teste_str == data_fim_atendimento_str) {
                // Fim da alocação
                if (!$scope.job.trabalha_sabado && data_teste.date(i).day() == 6) {
                    var cls = 'feriado'
                    var titulo = "Sábado não trabalhado."
                }
                else if (!$scope.job.trabalha_domingo && data_teste.date(i).day() == 0) {
                    var cls = 'feriado'
                    var titulo = "Domingo não trabalhado."
                }
                else if (feriado = lista_feriados.find(x => x.data == data_teste_str)) {
                    var cls = 'feriado'
                    titulo = feriado.desc
                }
                else if (lista_cancelados_cliente.find(x => x == data_teste_str)) {
                    var cls = 'cancelado-cliente'
                    var titulo = "Cancelado pelo cliente"
                }
                else {
                    var cls = "trabalho"
                    var titulo = "Dia de trabalho."
                    $scope.job.dias_uteis_alocacao++
                }
                dias_mes2.push({ classe: cls, "titulo": "Final da alocação. " + titulo, texto: i })
            }
            else {
                // Dias restantes do mês não usados na alocação
                dias_mes2.push({ classe: "", "titulo": "Fora do período de trabalho", texto: i })
            }
        }
        $scope.calendario1.dias_mes = dias_mes1
        $scope.calendario2.dias_mes = dias_mes2

    }

    /** ====================
     * SLA EVENTOS
     ====================**/
    $scope.eventos = []

    function seta_timer_sla(tempo, id_elemento, classe) {
        if (tempo > 2147483647)
            return
        if ($scope.eventos.indexOf(id_elemento) >= 0)
            return
        else {
            let id_evento = setTimeout(function (id_elemento, classe) {
                $(id_elemento).removeClass('bg-primary')
                $(id_elemento).addClass(classe)
                $rootScope.adiciona_historico(id_elemento + " perdido!!!", 400)
                alert(id_elemento, ' Perdido!!!!!')
                $rootScope.$apply()
            }, tempo, id_elemento, classe)
            $scope.eventos[id_evento] = id_elemento
        }
    }

    function reseta_eventos() {
        for (let evento in $scope.eventos) {
            clearTimeout(evento)
        }
        $scope.eventos = []
    }

    $scope.$on('$destroy', () => reseta_eventos())

    let verifica_sla = function () {
        reseta_eventos()
        let data_atual = Date.now()
        elementos_sla.forEach(function (elemento, indice, vetor) {
            let data_evento = $scope.job["dh_" + elemento]
            let sla = $scope.job["sla_" + elemento]
            let id_elemento = "#sla_" + elemento
            if (!sla) {
                $(id_elemento).css('background-color', '')
            }
            else if (data_evento) {
                if (data_evento <= sla) {
                    $(id_elemento).addClass('bg-primary')
                }
                else {
                    $(id_elemento).removeClass('bg-primary')
                    $(id_elemento).addClass('bg-danger')
                }
            }
            else {
                let data_sla = Date.parse(sla)
                if (data_atual < data_sla) {
                    let timer = (data_sla - data_atual)
                    seta_timer_sla(timer, id_elemento, 'bg-danger')
                    $(id_elemento).addClass('bg-primary')
                }
                else {
                    $(id_elemento).removeClass('bg-primary')
                    $(id_elemento).addClass('bg-danger')
                }
            }
        })
    }


    /** ====================
     * METODO LISTA
     ====================**/
    $scope.lista = function (filtro_param) {
        if ($rootScope.usuario_logado.grupo == "Gestor de Demanda")
            $rootScope.conta_job()

        if (filtro_param.id) {
            $scope.get(filtro_param.id, false, true)
            return
        }

        if (filtro_param.status) {
            var itens = []
            for (var i = 0; i < filtro_param.status.length; i++)
                itens.push(filtro_param.status[i].valor)
            filtro_param.status = itens
        }

        let filtro = $rootScope.otimiza_filtro(filtro_param)


        if (filtro.meus == undefined)
            filtro.meus = !$scope.lista_todos
        else
            filtro.meus = filtro.meus === 'true'

        $rootScope.seta_gravar(true)
        $scope.jobs = []
        $http({
            url: config.base_url + "/job/novo_lista",
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $scope.jobs = data
        }).error(function (data, status) {
            $rootScope.seta_gravar(false)
            $scope.jobs = []
            $rootScope.erro_portal(data, status)
        })
    }



    $scope.listagem_rapida = function (filtros, btn_selecionado) {
        $scope.lista_rapida_selected = btn_selecionado
        if (filtros.length == 0) {
            alert("Filtro inválido")
            return
        }
        var filtro = "?q=status:" + filtros.join(",")

        if (!$scope.lista_todos && filtros[0] != 'Aberto' && $rootScope.usuario_logado.id_funcionario)
            filtro += "|id_gestor:" + $rootScope.usuario_logado.id_funcionario
        $rootScope.seta_gravar(true)
        $http({
            url: config.base_url + '/job/dashboard' + filtro,
            method: 'GET'
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            $scope.jobs = data
        })
            .error(function (data, status) {
                $rootScope.seta_gravar(false)
                $scope.jobs = []
                $rootScope.erro_portal(data, status)
            })
    }

    /** ====================
     * METODOS ADICIONA
     ====================**/
    $scope.adiciona = function (job, gd_adciona_detalha) {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + base_url_job,
            method: 'POST',
            data: job
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.seta_gravar(false)
            if (gd_adciona_detalha) {
                $scope.muda_gd(data.id, $rootScope.usuario_logado.id_funcionario)
                $location.path('/job/detalha/' + data.id)
            }
            $scope.init_job()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }

    $scope.lista_flags = function (nome, insere_seleciona) {
        let filtro = { status: 'ativo' }
        if (nome)
            filtro.filtro = nome
        $http({
            url: config.base_url + "/flag/lista",
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            if (insere_seleciona)
                data.splice(0, 0, { id: null, flag: "SELECIONE" })
            $scope.lista_status = data
        }).error(function (data, status) {
            $rootScope.adiciona_historico(data, status)
        })
    }

    $scope.lista_cliente = function (filtro_busca_cliente) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtro_busca_cliente)
        filtro_otimizado['status'] = "ativo"
        $http({
            url: config.base_url + "/cliente/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function (data, status) {
            $scope.clientes = data
        }).error(function (data, status) {
            $scope.clientes = []
            $rootScope.adiciona_historico("Cliente Inativo ou não encontrado. Não é possível cadastrar jobs.", status)
        })
    }
    $scope.get_cliente = function (id_cliente) {
        $http({
            url: config.base_url + "/cliente/" + id_cliente,
            method: 'GET'
        }).success(function (data, status) {
            if (data.status != 'inativo') {
                $scope.job.nome_cliente = data.nome_cliente
                $scope.job.id_cliente = data.id
                $scope.codigo_cliente_obrigatorio = data.cod_chamado_cli_obrigatorio
            }
            else {
                $rootScope.adiciona_historico("Cliente Inativo. Não é possível cadastrar jobs.", status)
            }
        }).error(function (data, status) {
            $rootScope.adiciona_historico("Cliente Inativo ou não encontrado. Não é possível cadastrar jobs.", status)
        })
    }
    $scope.seleciona_cliente = function (cliente) {
        if (cliente.selecionado) {
            cliente.selecionado = false
            if (path == '/job/adiciona') {
                $scope.job.nome_cliente = ''
                $scope.job.id_cliente = ''
                $scope.job.codigo_cliente_obrigatorio = null
            } else {
                $scope.filtros.id_cliente = null
                $scope.cliente_selecionado = ''
            }
        }
        else {
            $scope.clientes.filter(function (item) {
                return item.selecionado = false
            })
            cliente.selecionado = true
            if (path == '/job/adiciona') {
                $scope.job.nome_cliente = cliente.nome_cliente
                $scope.job.id_cliente = cliente.id
                $scope.codigo_cliente_obrigatorio = cliente.cod_chamado_cli_obrigatorio
            } else {
                $scope.filtros.id_cliente = cliente.id
                $scope.cliente_selecionado = cliente.nome_cliente
            }
        }
    }

    $scope.lista_agregado_cliente = function (filtro_busca_agregado_cliente, id_cliente) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtro_busca_agregado_cliente)
        filtro_otimizado['status'] = "ativo",
            filtro_otimizado['id_cliente'] = $scope.job.id_cliente,
            $http({
                url: config.base_url + "/agregado_cliente/lista",
                method: 'POST',
                data: filtro_otimizado
            }).success(function (data) {
                $scope.agregado_clientes = data
                $scope.id_agregado_cliente = data.id
            }).error(function (data, status) {
                $scope.agregado_clientes = []
                $rootScope.erro_portal(data, status)
            })
    }
    $scope.seleciona_cliente_agregado = function (cliente) {
        if (cliente.selecionado) {
            cliente.selecionado = false
            $scope.cliente_selecionado = false

        }
        else {
            $scope.agregado_clientes.filter(function (item) {
                return item.selecionado = false
            })
            $scope.cliente_selecionado = cliente
            cliente.selecionado = true
        }
    }

    $scope.seleciona_doutor_lista_job = function (doutor) {
        if (doutor.selecionado) {
            doutor.selecionado = false
            $scope.filtros.id_doutor = null
            $scope.doutor_selecionado = ''
        } else {
            $scope.doutores.filter(function (item) {
                return item.selecionado = false
            })
            doutor.selecionado = true
            $scope.filtros.id_doutor = doutor.id
            $scope.doutor_selecionado = doutor.nome
        }
    }

    $scope.lista_orientacao = function (id_cliente) {
        let filtro = {
            "status": "ativo",
            "id_cliente": id_cliente
        }
        $http({
            url: config.base_url + "/orientacao/lista",
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            if (!$scope.job.id_orientacao)
                $scope.job.id_orientacao = undefined
            data.splice(0, 0, { id: undefined, nome: "SELECIONE" })
            $scope.orientacoes = data
        }).error(function (data, status) {
            if (status == 404) {
                if ($rootScope.usuario_logado.perfil == 'funcionario') {
                    $scope.orientacoes = [{ id: undefined, nome: "Orientação Padrão NetSupport" }]
                    $scope.job.id_orientacao = undefined
                    $rootScope.adiciona_historico("Cliente não possui orientações cadastradas. Será utilizada a orientação padrão da NetSupport.", status)
                }
            }
            else
                $rootScope.erro_portal(data, status)
        })
    }


    /** ====================
     * METODO ADICIONA JOB CLIENTE
     ====================**/
    $scope.lista_endereco_cliente = function (id_cliente) {
        $http({
            url: config.base_url + base_url_cliente + "/" + id_cliente,
            method: 'GET'
        }).success(function (data, status) {
            $scope.job.nome_local_atendimento = data.nome_fantasia
            $scope.job.cep = data.cep
            $scope.job.numero = data.numero
            $scope.job.logradouro = data.logradouro
            $scope.job.bairro = data.bairro
            $scope.job.cidade = data.cidade
            $scope.job.estado = data.estado
            $scope.job.complemento = data.complemento
            $rootScope.get_geolocation($scope.job, $scope)
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    /** ====================
     * METODOS DETALHA
     ====================**/
    $scope.get = function (id_job, lista_orientacao, retorna_lista) {
        $http({
            url: config.base_url + base_url_job + "/" + id_job,
            method: 'GET'
        }).success(function (data, status) {
            if (retorna_lista) {
                if ($rootScope.usuario_logado.perfil == 'funcionario')
                    $location.path('/job/detalha/' + data.id)
                else
                    $location.path('/' + $rootScope.usuario_logado.perfil + '/job/detalha/' + data.id)
            }
            else
                $scope.job = data
            if (lista_orientacao && !$rootScope.usuario_logado.id_cliente)
                $scope.lista_orientacao(data.id_cliente)
            verifica_sla()
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    $scope.get_orientacao = function (id_orientacao, forma_atendimento) {
        if (id_orientacao) {
            var url = config.base_url + "/orientacao/" + id_orientacao
            forma_atendimento = ""
        }
        else {
            var url = config.base_url + "/orientacao_padrao"
            forma_atendimento = "_" + forma_atendimento
        }

        $http({
            url: url,
            method: 'GET'
        }).success(function (data, status) {
            $scope.orientacao_job = {
                orientacao: data["orientacao" + forma_atendimento],
                requerimento: data["requerimento" + forma_atendimento],
                rat: data["rat" + forma_atendimento]
            }
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    /** ====================
     * DESABILITA BTNS
     ====================**/
    function verificao_basica(id_botao, acao) {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        if (!$rootScope.usuario_logado) {
            $(id_botao).attr('title', "")
            return true
        }
        if ($rootScope.usuario_logado.grupo == 'Doutor') {
            $(id_botao).attr('title', "Supporters podem " + acao + " jobs")
            return false
        }
        if (['Gestor de Demanda', 'TI', 'Gestor de Operação'].indexOf($rootScope.usuario_logado.grupo) == -1) {
            $(id_botao).attr('title', "Somente Gestores de Demanda, Gestores de Operação e TI podem " + acao + " jobs")
            return true
        }
        if ($rootScope.usuario_logado.id_funcionario != $scope.job.id_gestor) {
            $(id_botao).attr('title', "Você não é o Gestor de Demandas do Job. Pegue o job para você primeiro!!")
            return true
        }
        if (["Fechado", "Cancelado", "Rescindido"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_divulgar').attr('title', "Job FECHADO, RESCINDIDO ou CANCELADO não podem mais ser alterados.")
            return true
        }
    }

    function status_atual_menor_que(status) {
        return $scope.status.indexOf(status) < $scope.status.indexOf($scope.job.status)
    }

    $scope.desabilita_pegar_job = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        if (!$rootScope.usuario_logado) {
            $('#btn_pega_job').attr('title', "")
            return true
        }
        if (['Gestor de Demanda', 'TI', 'Gestor de Operação'].indexOf($rootScope.usuario_logado.grupo) == -1) {
            $('#btn_pega_job').attr('title', "Somente Gestores de Demanda, Gestores de Operação e TI podem pegar jobs.")
            return true
        }
        if ($rootScope.usuario_logado.id_funcionario == $scope.job.id_gestor) {
            $('#btn_pega_job').attr('title', "Você já é o Gestor de Demandas.")
            return true
        }
        if (["Fechado", "Cancelado"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_divulgar').attr('title', "Job FECHADO ou CANCELADO não pode ser alterado.")
            return true
        }
        $('#btn_pega_job').attr('title', "Coloca você como Gestor de Demanda responsável")
        return false
    }

    $scope.desabilita_categorizar = function () {
        if (verificao_basica('#btn_categorizar', 'categorizar'))
            return true
        if (["Com Gestor", "Categorizado"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_categorizar').attr('title', "Categoriza o Job")
            return false
        }
        $('#btn_categorizar').attr('title', "Categorização só pode ser feita com status Com Gestor ou Categorizado")
        return true
    }

    $scope.desabilita_divulgar = function () {
        if (verificao_basica('#btn_divulgar', 'divulgar'))
            return true
        if (["Categorizado", "Reagendado"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_divulgar').attr('title', "Divulga job no Slack")
            return false
        }
        $('#btn_divulgar').attr('title', "Divulgação só pode ser feita com status Categorizado ou Reagendado")
        return true
    }

    $scope.desabilita_associa_doutor = function () {
        if (verificao_basica('#btn_associa_doutor', 'associar doutor'))
            return true
        if (["Divulgado", "Reagendado", "Sem Doutor"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_associa_doutor').attr('title', "Seleciona supporter que se candidatou ao job")
            return false
        }
        $('#btn_associa_doutor').attr('title', "Supporter só pode selecionado com status Divulgado, Reagendado ou Sem Supporter")
        return true
    }

    $scope.desabilita_orientacao = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        $('#btn_associa_doutor').attr('title', "Supporter deve declarar estar orientado antes de prosseguir para próximas etapas do atendimento")
        return false
    }

    $scope.desabilita_inicio_deslocamento = function () {
        if (verificao_basica('#btn_inicio_deslocamento', 'associar doutor'))
            return true
        if ($scope.job.status == "Doutor orientado" && $scope.job.forma_atendimento == "presencial") {
            $('#btn_inicio_deslocamento').attr('title', "Informa início do deslocamento do supporter")
            return false
        }
        if ($scope.job.status == "Doutor orientado" && $scope.job.forma_atendimento == "remoto") {
            $scope.job.status = "Doutor em trânsito"
            return true
        }
        $('#btn_inicio_deslocamento').attr('title', "Início de deslocamento só pode ser informado após Supporter declarar estar orientado")
        return true
    }

    $scope.desabilita_checkin = function () {
        if (verificao_basica('#btn_checkin', 'checkin'))
            return true
        if ($scope.job.status == "Doutor em trânsito") {
            $('#btn_checkin').attr('title', "Informa chegada do Supporter ao local de atendimento")
            return false
        }
        $('#btn_checkin').attr('title', "Check-in só pode ser feito após Supporter informar início de deslocamento e estar no local de atendimento")
        return true
    }

    $scope.desabilita_anexa_arquivo = function () {
        if (verificao_basica('#btn_anexa_arquivo', 'anexar arquivo'))
            return true
        if (["Doutor no local", "Falha validação"].indexOf($scope.job.status) >= 0) {
            $('#btn_anexa_arquivo').attr('title', "Anexa arquivo")
            return false
        }
        $('#btn_anexa_arquivo').attr('title', "Anexos só podem ser inseridos com status Supporter no local ou quando houver necessidade de revisão por motivo de falha de validação")
        return true
    }

    $scope.desabilita_encerra_job = function () {
        if (verificao_basica('#btn_encerra_job', 'encerrar'))
            return true
        if (["Doutor no local", "Falha validação"].indexOf($scope.job.status) >= 0) {
            $('#btn_encerra_job').attr('title', "Encerra o atendimento")
            return false
        }
        $('#btn_encerra_job').attr('title', "Encerramento só pode ser feito com status Supporter no local e após encerramento do atendimento ou quando houver necessidade de revisão por motivo de falha de validação. Caso tenha feito encerramento errado, entre em contato com o Gestor de Demanda e peça a ele para liberar o job para ajustes.")
        return true
    }

    $scope.desabilita_valida_atendimento = function () {
        if (verificao_basica('#btn_valida_atendimento', 'validar atendimento'))
            return true
        if (["Validado com sucesso", "Atendimento encerrado"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_valida_atendimento').attr('title', "Valida atendimento")
            return false
        }
        $('#btn_valida_atendimento').attr('title', "Validação só pode ser feita com status Atendimento encerrado ou Validado com sucesso, sendo que este último é para corrigir uma validação errada.")
        return true
    }
    $scope.desabilita_finaliza_job = function () {
        if (verificao_basica('#btn_desabilita_finaliza_job', 'finalizar job'))
            return true
        if (["Validado com sucesso"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_desabilita_finaliza_job').attr('title', "Finalizar job")
            return false
        }
        $('#btn_desabilita_finaliza_job').attr('title', "Finalização de job só pode feito em jobs validados com sucesso.")
        return true
    }

    $scope.desabilita_job_nao_faturavel = function () {
        if ($scope.gravar_clicado)
            return true
        if (["Fechado", "Cancelado", "Rescindido"].indexOf($scope.job.status) >= 0) {
            $('#btn_job_nao_faturavel').attr('title', "Não é permitido mudar faturamento em jobs fechados, cancelados ou rescindidos.")
            return true
        }
        if ($rootScope.usuario_logado && ["Gestor de Operação", "TI"].indexOf($rootScope.usuario_logado.grupo) == -1) {
            $('#btn_job_nao_faturavel').attr('title', "Somente Gestor de Operação e TI podem mudar o faturamento do job.")
            return true
        }
        $('#btn_job_nao_faturavel').attr('title', "Configura job para não ser faturado para o cliente.")
        return false
    }

    $scope.desabilita_job_faturavel = function () {
        if ($scope.gravar_clicado)
            return true
        if (["Fechado", "Cancelado", "Rescindido"].indexOf($scope.job.status) >= 0) {
            $('#btn_job_faturavel').attr('title', "Não é permitido mudar faturamento em jobs fechados, cancelados ou rescindidos.")
            return true
        }
        if ($rootScope.usuario_logado && ["Gestor de Operação", "TI"].indexOf($rootScope.usuario_logado.grupo) == -1) {
            $('#btn_job_faturavel').attr('title', "Somente Gestor de Operação e TI podem mudar o faturamento do job.")
            return true
        }
        $('#btn_job_faturavel').attr('title', "Configura job para ser faturado para o cliente.")
        return false
    }

    $scope.desabilita_cancela_job = function () {
        if (verificao_basica('#btn_cancela_job', 'cancelar o job'))
            return true
        $('#btn_cancela_job').attr('title', "Cancela o job")
        return false
    }

    $scope.desabilita_cancela_agendamento = function () {
        if ($scope.job.tipo != 'alocacao') {
            $('#btn_cancela_agendamento').attr('title', "Cancelamento de agendamentos disponível apenas para alocação.")
            return true
        }
        if (verificao_basica('#btn_cancela_agendamento', 'cancelar agendamentos'))
            return true
        $('#btn_cancela_agendamento').attr('title', "Cancela agendamentos de uma alocação")
        return false
    }

    $scope.desabilita_rescinde_alocacao = function () {
        if ($scope.job.tipo != 'alocacao') {
            $('#btn_rescinde_alocacao').attr('title', "Rescisão de alocação disponível apenas para alocação.")
            return true
        }
        if ($scope.job.qtd_atendimentos_encerrados == 0) {
            $('#btn_rescinde_alocacao').attr('title', "Rescisão só pode ser feita se alocação tiver pelo menos um atendimento validado. Como não houve até agora cancele o job.")
            return true
        }
        if (verificao_basica('#btn_rescinde_alocacao', 'rescindir alocação'))
            return true
        $('#btn_rescinde_alocacao').attr('title', "Rescinde uma alocação")
        return false
    }

    $scope.desabilita_agenda = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        if ($scope.job.tipo != 'alocacao') {
            $('#btn_agenda').attr('title', "Agenda disponível apenas para alocações.")
            return true
        }
        $('#btn_agenda').attr('title', "Mostra a agenda da alocação")
        return false
    }

    $scope.desabilita_reabre_job = function () {
        function pode_reabrir() {
            if ($scope.job.status != "Validado com sucesso" || $scope.job.dh_aceite_cliente == null) {
                $('#btn_reabre_job').attr('title', "Reabertura só pode ser feita com status Validado com sucesso, com job validado pelo cliente e dentro das 72h desde o encerramento com aceite. Motivo: status inválido ou cliente não aceitou o job.")

                return false
            }
            var dh_aceite_cliente = Date.parse($scope.dh_aceite_cliente)
            var agora = Date.now()

            if ((agora - dh_aceite_cliente) / 1000 / 60 / 60 > 72) {
                $('#btn_reabre_job').attr('title', "Reabertura só pode ser feita com status Validado com sucesso, com job validado pelo cliente e dentro das 72h desde o encerramento com aceite. Motivo: job tem mais de 72h de fechado.")
                return false
            }
            return true
        }

        if (verificao_basica('#btn_reabre_job', 'reabre job'))
            return true
        if (pode_reabrir()) {
            $('#btn_reabre_job').attr('title', "Reabre")
            return false
        }
        return true
    }

    $scope.desabilita_associa_doutor_direto = function () {
        if (verificao_basica('#btn_associa_doutor_direto', 'associar doutor diretamente'))
            return true
        if (["Sem Doutor", "Categorizado", "Reagendado", "Divulgado"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_associa_doutor_direto').attr('title', "Associa Supporter diretamente")
            return false
        }
        $('#btn_associa_doutor_direto').attr('title', "Associação direta de Supporter só pode ser feita com status Categorizado, Divulgado ou Sem Supporter.")
        return true
    }

    $scope.desabilita_desassocia_doutor = function () {
        if (verificao_basica('#btn_desassocia_doutor', 'desassociar doutor'))
            return true
        if (["Com Doutor", "Doutor orientado", "Doutor em trânsito", "Doutor no local", "Atendimento encerrado", "Fechamento cancelado"].indexOf($scope.job.status) >= 0) {
            $('#btn_desassocia_doutor').attr('title', "Remove supporter do job cancelando o atendimento atual. ATENÇÃO: o supporter não receberá nada pelo atendimento se ele for cancelado!!!")
            return false
        }
        $('#btn_desassocia_doutor').attr('title', "Desassociação de supporter só pode ser feita com status Com Supporter")
        return true
    }

    $scope.desabilita_inserir_notas = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        $('#btn_inserir_notas').attr('title', "Insere informações adicionais ao job.")
        return false
    }

    $scope.desabilita_reagenda_job = function () {
        if (verificao_basica('#btn_reagenda_job', 'reagenda job'))
            return true

        if (["Categorizado", "Divulgado", "Sem Doutor", "Reagendado",
            "Validado com sucesso", "Com Doutor", "Doutor orientado", "Doutor em trânsito",
            "Doutor no local", "Atendimento encerrado"].indexOf($scope.job.status) >= 0) {
            $('#btn_reagenda_job').attr('title', "Altera a data e hora de agendamento de atendimento.")
            return false
        }
        $('#btn_reagenda_job').attr('title', "Não é permitido reagendar um job no status atual.")

        return true
    }

    $scope.desabilita_alterar_gestor = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        if (["Fechado", "Cancelado"].indexOf($scope.job["status"]) >= 0) {
            $('#btn_alterar_gd').attr('title', "Jobs com status Fechado ou Cancelado não podem ser alterados ")
            return true
        }
        $('#btn_alterar_gd').attr('title', "Altera Gestor de Demanda.")
        return false
    }

    $scope.desabilita_lancamentos_job = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        if (["Fechado", "Cancelado", "Rescindido"].indexOf($scope.job.status) >= 0) {
            $('#btn_lancamentos_job').attr('title', "Não é permitido fazer lançamentos em jobs fechados, cancelados ou rescindidos.")
            return true
        }
        if ($rootScope.usuario_logado && ["Gestor de Operação", "TI"].indexOf($rootScope.usuario_logado.grupo) == -1) {
            $('#btn_lancamentos_job').attr('title', "Somente Gestor de Operação e TI podem fazer lançamentos no job.")
            return true
        }
        $('#btn_lancamentos_job').attr('title', "Insere um crédito ou débito num atendimento do job.")
        return false
    }

    $scope.desabilita_km_adicional = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        if (["Fechado", "Cancelado", "Rescindido"].indexOf($scope.job.status) >= 0) {
            $('#btn_km_adicional').attr('title', "Não é permitido fazer lançamentos em jobs fechados, cancelados ou rescindidos.")
            return true
        }
        if ($rootScope.usuario_logado && ["Gestor de Demanda", "Gestor de Operação", "TI"].indexOf($rootScope.usuario_logado.grupo) == -1) {
            $('#btn_km_adicional').attr('title', "Somente Gestor de Demanda, Gestor de Operação e TI podem fazer lançamentos no job.")
            return true
        }
        $('#btn_km_adicional').attr('title', "Insere deslocamento adicional a um job.")
        return false
    }

    $scope.desabilita_fechamento_job = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        let msg = "Apenas Jobs com status 'finalizado' podem ser fechados."
        if (["Finalizado", "Fechamento cancelado"].indexOf($scope.job["status"]) < 0) {
            $('#btn_fechamento_job').attr('title', msg + " Motivo: status inválido")
            return true
        }
        $('#btn_fechamento_job').attr('title', "Fecha o Job.")
        return false
    }

    $scope.desabilita_cancela_fechamento_job = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        let msg = "Apenas Jobs com status 'Fechado' ou 'Rescindido' podem ser cancelados."
        if (["Fechado", "Rescindido"].indexOf($scope.job["status"]) < 0) {
            $('#btn_cancela_fechamento_job').attr('title', msg + " Motivo: status inválido")
            return true
        }
        $('#btn_cancela_fechamento_job').attr('title', "Cancelar o Fechamento.")
        return false
    }

    $scope.desabilita_detalhar_fechamento_job = function () {
        if ($scope.gravar_clicado)
            return $scope.gravar_clicado
        if (["Fechado", "Cancelado", "Rescindido"].indexOf($scope.job["status"]) < 0) {
            $('#btn_detalhar_fechamento_job').attr('title', "Somente jobs fechados ou cancelados podem ter fechamento detalhado")
            return true
        }
        $('#btn_detalhar_fechamento_job').attr('title', "Detalha o fechamento do Job.")
        return false
    }

    /** ====================
     * MODAL CATEGORIZACAO
     ====================**/
    $scope.lista_tipo_servico = function (gera_calendario) {
        if (!$scope.job.forma_atendimento || !$scope.job.tipo) {
            $scope.tipos_servicos = [{ id: null, nome: "SELECIONE Tipo e Forma de Atendimento" }]
            $scope.job.tipo_servico_selecionado = $scope.tipos_servicos[0]
            return
        }
        let filtro = {
            "forma_atendimento": $scope.job.forma_atendimento,
            "tipo": $scope.job.tipo,
            "id_base_custo": $scope.job.id_base_custo,
            "status": "ativo"
        }
        $http({
            url: config.base_url + "/tipo_servico/lista",
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            data.splice(0, 0, { id: null, nome: "SELECIONE" })
            $scope.tipos_servicos = data
            if (gera_calendario) {
                $scope.atualiza_tipo_servico_selecionado()
                $scope.gera_calendario()
            }
        })
            .error(function (data, status) {
                $scope.tipos_servicos = [{ id: null, nome: "SELECIONE Tipo e Forma de Atendimento" }]
                $scope.job.id_tipo_servico == null
                if (status == 404)
                    $rootScope.adiciona_historico(data, status)
                else
                    $rootScope.erro_portal(data, status)
            })
    }

    $scope.lista_clientes_cliente = function (id_cliente) {
        if (!id_cliente)
            id_cliente = $scope.job.id_cliente
        let filtro = { "id_cliente": id_cliente }
        $http({
            url: config.base_url + "/cliente_cliente/lista",
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            data.splice(0, 0, { id: undefined, nome: "SELECIONE" })
            $scope.clientes_cliente = data
        })
            .error(function (data, status) {
                $scope.clientes_cliente = [{ id: undefined, nome: "SELECIONE" }]
                if (status == 404)
                    $rootScope.adiciona_historico(data, status)
                else
                    $rootScope.erro_portal(data, status)
            })
    }

    $scope.categoriza = function ({ obj, id_modal }) {
        obj.divulga = $scope.job.divulga
        $scope.job.folga_obrigatoria = $scope.job.folga_obrigatoria.toString().split(' ')[4]
        let dados = _.pick(obj, ['id_cliente_cliente', 'id_agregado_cliente', 'tipo', 'forma_atendimento', 'id_tipo_servico',
            'dias_uteis_alocacao', 'trabalha_sabado', 'trabalha_domingo',
            'folga_obrigatoria', 'feriados', 'cancelados_cliente',
            'valor_diferenciado', 'id_orientacao', 'divulga'])
        if ($scope.cliente_selecionado) {
            dados.id_agregado_cliente = $scope.cliente_selecionado.id
        }
        else {
            dados.id_agregado_cliente = null
        }
        if (!dados.id_orientacao)
            dados.id_orientacao = null
        $scope.insere_evento(obj.id, "categorizacao", dados, id_modal)
    }

    /** ====================
     * MODAL ASSOCIA DOUTOR
     ====================**/
    $scope.descarta_doutor = function (id_job, id_candidato_job, motivo_descarte, modal_destino) {
        if (!motivo_descarte) {
            $rootScope.adiciona_historico("Informe o motivo do descarte do supporter.", 403)
            return
        }
        let dados_descarte = { motivo_descarte: motivo_descarte }
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + id_job + "/descarta_candidato_job/" + id_candidato_job,
            data: dados_descarte,
            method: 'PUT'
        }).success(function (data, status) {
            $rootScope.adiciona_historico("Supporter descartado do job.", 403)
            $scope.seta_gravar(false)
            $scope.lista_candidato_job(id_job, modal_destino)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }

    $scope.seleciona_doutor = function (id_job, id_candidato_job, id_modal) {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + id_job + "/seleciona_candidato_job/" + id_candidato_job,
            method: 'PUT'
        }).success(function (data, status) {
            $rootScope.adiciona_historico("Supporter selecionado com sucesso.", status)
            $scope.get(id_job)
            if (id_modal)
                $(id_modal).modal('hide')
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }

    $scope.lista_candidato_job = function (id_job, modal_destino) {
        let filtro = { 'status': 'na_fila' }
        $http({
            url: config.base_url + '/job/' + id_job + "/candidato_job",
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            $scope.candidatos_job = data
        })
            .error(function (data, status) {
                $scope.candidatos_job = []
                if (status == 404)
                    $rootScope.adiciona_historico("Nenhum candidato para o job encontrado.", status)
                else
                    $rootScope.erro_portal(data, status)
                $(modal_destino).modal('hide')
            })
    }



    /** ====================
     * MODAL ANEXA ARQUIVO
     ====================**/
    $scope.remove_arquivo = function (id_job, nome_arquivo) {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + id_job + "/arquivo/" + nome_arquivo,
            method: 'DELETE'
        }).success(function (data, status) {
            $scope.get(id_job)
            $rootScope.adiciona_historico("Arquivo " + nome_arquivo + " removido com sucesso", status)
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }

    $scope.grava_arquivo = function (id_job, arquivo) {
        if (arquivo) {
            $scope.seta_gravar(true)
            Upload.upload({
                url: config.base_url + "/job/" + id_job + "/arquivo",
                data: { arquivo: arquivo },
            }).success(function (data, status) {
                $rootScope.adiciona_historico(data.msg, status)
                $scope.get(id_job)
                $scope.arquivo = null
                $scope.seta_gravar(false)
            }).error(function (data, status) {
                $rootScope.erro_portal(data, status)
                $scope.seta_gravar(false)
            })
        }
    }

    $scope.verifica_tipo_arquivo = function (arquivo) {
        $scope.arquivo_tamanho_nao_suportado = false
        $scope.tipo_arquivo_invalido = false
        $scope.arquivo_valido = false

        if (!arquivo)
            return

        let msg_tamanho_invalido = ""
        if (arquivo.size > 2000000) {
            $scope.arquivo_tamanho_nao_suportado = true
            msg_tamanho_invalido = " Tamanho do arquivo maior que permitido, deve ter no máximo 2MB"
        }

        let msg_tipo_invalido = ""
        if (arquivo && ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'].indexOf(arquivo.type) < 0) {
            $scope.tipo_arquivo_invalido = true
            msg_tipo_invalido = "formato do arquivo não permitido. Arquivo deve ser imagem nos formatos JPG ou PNG ou um PDF."
        }

        if ($scope.arquivo_tamanho_nao_suportado || $scope.tipo_arquivo_invalido)
            $rootScope.erro_portal('Arquivo Inválido: ' + msg_tipo_invalido + msg_tamanho_invalido, 400)
        else
            $scope.arquivo_valido = true
    }

    /** ====================
     * MODAL ENCERRAR JOB
     ====================**/
    $scope.carrega_encerrar_job = function () {
        if ($scope.job.status == "Doutor no local")
            $scope.init_encerrar_job()
        if ($scope.job.status == "Falha validação") {
            $scope.encerra_job = {}
            $scope.encerra_job.deslocamento = String($scope.job.deslocamento)
            $scope.encerra_job.duracao_atendimento = $scope.job.at_duracao_atendimento
            $scope.encerra_job.descricao_atendimento = $scope.job.descricao_atendimento
            $scope.verifica_hora_extra()
        }
    }

    $scope.encerra = function ({ id_job, encerra_job, id_modal }) {
        $scope.insere_evento(id_job, 'encerra_job', encerra_job, id_modal)
    }


    /** ====================
     * MODAL VALIDA ATENDIMENTO
     ====================**/
    $scope.valida = function ({ id_job, validacao, id_modal }) {
        $scope.insere_evento(id_job, 'valida', validacao, id_modal)
    }

    $scope.invalida = function ({ id_job, validacao, id_modal }) {
        $scope.insere_evento(id_job, 'invalida', validacao, id_modal)
    }

    $scope.doutor_orientado = function ({ id_job, id_modal }) {
        $scope.insere_evento(id_job, 'orienta_doutor', { msg: "Confirmada orientação para job" }, id_modal)
    }

    /** ====================
     * MODAL ACEITE CLIENTE
     ====================**/
    $scope.adiciona_finaliza_job = function ({ id_job, finaliza_job, id_modal }) {
        $scope.insere_evento(id_job, 'finaliza_job', finaliza_job, id_modal)
    }

    $scope.adiciona_fatura_job = function ({ id_job, faturamento, id_modal }) {
        $scope.insere_evento(id_job, 'faturamento', faturamento, id_modal)
    }


    /** ====================
     * MODAL ALTERA GD
     ====================**/
    $scope.lista_gestor_demanda = function (modal_destino) {

        let filtros = {
            id_grupo: 3,
            status: "ativo"
        }
        $http({
            url: config.base_url + "/funcionario/lista",
            method: 'POST',
            data: filtros
        }).success(function (data, status) {
            data.splice(0, 0, { id: null, nome: "SELECIONE" })
            $scope.gestores = data
        })
            .error(function (data, status) {
                $scope.gestores = []
                if (status == 404)
                    $rootScope.adiciona_historico("Nenhum Gestor de Demanda encontrado. Não é possível transferir o job.", status)
                else
                    $rootScope.erro_portal(data, status)
                $(modal_destino).modal('hide')
            })
    }

    $scope.muda_gd = function (id_job, id_funcionario, id_modal) {
        if (id_funcionario)
            var url_acao = config.base_url + "/job/" + id_job + "/gestor/" + id_funcionario
        else
            var url_acao = config.base_url + "/job/" + id_job + "/gestor"

        $scope.seta_gravar(true)
        $http({
            url: url_acao,
            method: 'PUT'
        }).success(function (data, status) {
            $rootScope.adiciona_historico("Gestor de demanda alterado com sucesso.", status)
            $scope.get(id_job)
            if (id_modal)
                $(id_modal).modal('hide')
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }


    /** ====================
     * MODAL CANCELA JOB
     ====================**/
    $scope.cancela_job = function ({ id_job, cancela, id_modal }) {
        if (cancela.motivo_cancelamento == null) {
            $rootScope.adiciona_historico("O campo 'motivo do cancelamento' é obrigatório.", 400)
            $rootScope.modal_confirmacao_cancela()
            return
        }
        $scope.insere_evento(id_job, 'cancela_job', cancela, id_modal)
    }

    $scope.cancela_agendamentos = function ({ cancela_agendamento, id_modal }) {
        $scope.insere_evento($scope.job.id, 'cancela_agendamento', cancela_agendamento, id_modal)

    }

    $scope.rescinde_alocacao = function ({ id_job, cancela, id_modal }) {
        $scope.insere_evento(id_job, 'rescinde_alocacao', cancela, id_modal)
    }


    /** ====================
     * MODAL REMOVE DOUTOR
     ====================**/
    $scope.remove_doutor = function ({ desassocia_doutor, id_modal }) {
        $scope.insere_evento($scope.job.id, 'remove_doutor', desassocia_doutor, id_modal)
    }


    /** ====================
     * MODAL ASSOCIACAO DIRETA
     ====================**/
    $scope.get_doutor = function (id_doutor) {
        $http({
            url: config.base_url + "/doutor/" + id_doutor,
            method: 'GET'
        }).success(function (data, status) {
            $scope.doutores = []
            if (data.status == 'inativo') {
                $scope.doutor_direto.nome_doutor = ''
                $rootScope.erro_portal("Supporter com o ID: " + id_doutor + " está inativo.", 400)
                return
            }
            $scope.doutor_direto.nome_doutor = data.nome
        })
            .error(function (data, status) {
                $scope.doutor_direto.nome_doutor = null
                $rootScope.erro_portal(data, status)
            })
    }
    $scope.get_doutores = function (filtro_busca_doutor) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtro_busca_doutor)
        $http({
            url: config.base_url + "/doutor/lista",
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
    $scope.seleciona_doutor_direto = function (doutor) {
        if (doutor.selecionado) {
            doutor.selecionado = false
            $scope.doutor_direto = {}
        }
        else {
            $scope.doutores.filter(function (item) {
                return item.selecionado = false
            })
            if (doutor.status == 'inativo') {
                $scope.doutor_direto.nome_doutor = ''
                $rootScope.erro_portal("Supporter com o ID: " + doutor.id + " está inativo.", 400)
                return
            }
            doutor.selecionado = true
            $scope.doutor_direto.nome_doutor = doutor.nome
            $scope.doutor_direto.id_doutor = doutor.id
        }
    }

    $scope.associa_doutor_direto = function ({ job, dados_associacao, id_modal }) {
        if (job.id_doutor != null) {
            $rootScope.erro_portal("Job já possui supporter associado.", 400)
            $rootScope.modal_confirmacao_cancela()
            return
        }
        if (dados_associacao.nome_doutor == null) {
            $rootScope.erro_portal("Id supporter inválido.", 400)
            $rootScope.modal_confirmacao_cancela()
            return
        }
        if (!dados_associacao.motivo_associacao_direta) {
            $rootScope.erro_portal("O motivo da sassociação direta do supporter deve ser informado.", 400)
            $rootScope.modal_confirmacao_cancela()
            return
        }

        dados_associacao.tipo_associacao_doutor = 'direta'
        dados_associacao.msg = "Doutor " + dados_associacao.nome_doutor + " associado diretamente ao job"
        $scope.insere_evento(job.id, 'associa_doutor', dados_associacao, id_modal)
    }

    $scope.verifica_codigo_chamado_cliente_duplicado = function (id_cliente, codigo_chamado_cliente) {
        if (!codigo_chamado_cliente) {
            $scope.job.codigo_duplicado = false
            return
        }
        if (codigo_chamado_cliente && !id_cliente) {
            $scope.job.codigo_duplicado = true
            $rootScope.adiciona_historico("Selecione o cliente", 400)
            return
        }
        $http({
            url: config.base_url + "/cliente/" + id_cliente + "/codigo_chamado_cliente/" + codigo_chamado_cliente,
            method: 'GET'
        }).success(function (data, status) {
            $scope.job.codigo_duplicado = true
        }).error(function (data, status) {
            if (status == 404)
                $scope.job.codigo_duplicado = false
            else
                $rootScope.erro_portal(data, status)
        })
    }


    /** ====================
     * MODAL INSERE NOTA
     ====================**/
    $scope.adiciona_nota = function (id_job, nota, id_modal) {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + id_job + "/nota",
            data: nota,
            method: 'POST'
        }).success(function (data, status) {
            $scope.get(id_job)
            $rootScope.adiciona_historico(data.msg, status)
            if (id_modal)
                $(id_modal).modal('hide')
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }


    /** ====================
     * MODAL REABRIR JOB
     ====================**/
    $scope.reabre_job = function ({ id_job, reabre, id_modal }) {
        if ($scope.job.motivo_reabertura == null) {
            $rootScope.adiciona_historico("O campo 'motivo da reabertura' é obrigatório.", 400)
            $rootScope.modal_confirmacao_cancela()
            return
        }
        $scope.insere_evento(id_job, reabre, { motivo_reabertura: $scope.job.motivo_reabertura }, id_modal)
    }


    /** ====================
     * MODAL REAGENDAR JOB
     ====================**/
    $scope.reagenda_job = function ({ id_job, reagenda, id_modal }) {
        if (reagenda.motivo_reagendamento == null) {
            $rootScope.adiciona_historico("O campo 'motivo da reagendamento' é obrigatório.", 400)
            $rootScope.modal_confirmacao_cancela()
            return
        }
        $scope.insere_evento(id_job, 'reagenda', reagenda, id_modal)
    }

    /** ====================
    * MODAL ATENDIMENTOS JOB
    ====================**/
    $scope.lista_atendimentos_job = function (id_job, adiciona_selecione) {
        $http({
            url: config.base_url + "/job/" + id_job + "/atendimento",
            method: 'GET'
        }).success(function (data, status) {
            data.filter(function (item) {
                item.descricao = "Atendimento #" + item.id + " - Supporter: " + item.nome_doutor + " - Data: " + $rootScope.inverte_data_hora(item.dh_agendamento_cliente.substring(0, 19), "-", "/")
            })
            if (adiciona_selecione)
                data.splice(0, 0, { id: null, descricao: "SELECIONE" })
            $scope.atendimentos = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    /** ====================
     * MODAL HISTÓRICO JOB
    ====================**/
    $scope.get_historico = function (id_job) {
        $http({
            url: config.base_url + base_url_job + "/" + id_job + "/historico",
            method: 'GET'
        }).success(function (data, status) {
            $scope.historicos = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }


    /** ====================
     * MODAL LANÇAMENTOS JOB
     ====================**/
    $scope.adiciona_lancamento = function (id_job, lancamento, id_modal) {
        if (lancamento.tipo_lancamento == 'cobranca_cliente' && lancamento.valor_doutor == null) {
            lancamento.valor_doutor = 0.00
        }
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + id_job + "/lancamento",
            data: lancamento,
            method: 'POST'
        }).success(function (data, status) {
            $rootScope.adiciona_historico("Lançamento gravado com sucesso.", status)
            $scope.init_lancamento()
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }

    $scope.adiciona_km = function (id_job, km_adicional, id_modal) {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + id_job + "/km",
            data: km_adicional,
            method: 'POST'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data, status)
            $scope.init_km_adicional()
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $scope.seta_gravar(false)
            $rootScope.erro_portal(data, status)
        })
    }


    $scope.estorna_lancamento = function ({ lancamento }) {
        $http({
            url: config.base_url + "/job/" + lancamento.id_job + "/lancamento/" + lancamento.id,
            method: 'DELETE'
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.lista_lancamentos_job(lancamento.id_job)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_lancamentos_job = function (id_job) {
        $http({
            url: config.base_url + "/job/" + id_job + "/lancamento",
            method: 'GET'
        }).success(function (data, status) {
            $rootScope.lancamentos = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    /** ====================
     * FECHAMENTO JOB
     ====================**/
    function fechar() {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + $scope.id_job + "/fecha",
            data: {},
            method: 'POST'
        }).success(function (data, status) {
            $scope.get($scope.id_job)
            $rootScope.adiciona_historico(data, status)
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }
    $scope.fechamento_job = function (id_job) {
        $scope.id_job = id_job
        $rootScope.modal_confirmacao({
            cb: fechar,
            msg: 'Deseja solicitar o FECHAMENTO do job?'
        })

    }
    function cancela_fechamento() {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + $scope.id_job + "/cancela_fechamento",
            data: {},
            method: 'POST'
        }).success(function (data, status) {
            $scope.get($scope.id_job)
            $rootScope.adiciona_historico(data, status)
            $scope.seta_gravar(false)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }
    $scope.cancela_fechamento_job = function (id_job) {
        $scope.id_job = id_job
        $rootScope.modal_confirmacao({
            cb: cancela_fechamento,
            msg: 'Deseja CANCELAR O FECHAMENTO do job?'
        })

    }
    $scope.detalhar_fechamento_job = function (id_job) {
        $http({
            url: config.base_url + "/job/" + id_job + "/fecha/atendimento",
            method: 'GET'
        }).success(function (data, status) {
            $rootScope.fechamento = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_atendimento = function (filtros) {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)
        $scope.campos_lista_atendimento = filtro_otimizado.etapa
        $http({
            url: config.base_url + "/job/acompanhamento_atendimento",
            method: 'POST',
            data: filtro_otimizado
        }).success(function (data, status) {
            $scope.atendimentos = data
        })
            .error(function (data, status) {
                $scope.atendimentos = []
                $rootScope.erro_portal(data.msg, status)
            })
    }

    /** ====================
     * INSERE EVENTOS
     ====================**/
    $scope.insere_evento = function (id_job, nome_evento, dados_evento, id_modal) {
        if (!dados_evento)
            dados_evento = {}
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + "/job/" + id_job + "/evento/" + nome_evento,
            data: dados_evento,
            method: 'PUT'
        }).success(function (data, status) {
            $scope.get(id_job)
            $rootScope.adiciona_historico(data.msg, status)
            if (id_modal)
                $(id_modal).modal('hide')
            $scope.seta_gravar(false)

            if(nome_evento=='cancela_agendamento') $scope.lista_agendamentos(false, true, true)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }

    $scope.lista_agendamentos = function (insere_seleciona, completa, mostra_agenda) {
        let filtro = {}
        if (!completa)
            filtro.status = "agendado"
        $http({
            url: config.base_url + "/job/" + $scope.job.id + "/agendamento",
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            if (insere_seleciona)
                data.splice(0, 0, { id: null, descricao: "SELECIONE" })
            $scope.agendamentos = data
            if (mostra_agenda)
                $scope.mostra_agenda()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }
    $scope.$on("$destroy", function () {
        $interval.cancel($scope.lista_atendimento_cliente)
    })


    /** ==============
     * CHAMA METODOS
     ==============**/
    $scope.gravar_clicado = false
    $scope.seta_gravar = function (parametro) {
        $scope.gravar_clicado = parametro
        if (parametro) $scope.first = true
    }

    /** ==============
     * CHAMA METODOS
     ==============**/
    if (path.indexOf('/job/lista') >= 0) {
        if (!_.isEmpty($routeParams))
            $scope.lista($routeParams)
    }


    if (path.indexOf('/job/detalha') >= 0) {
        $scope.get($routeParams.id, true)
    }
    if (path.indexOf('/job/adiciona') >= 0) {
        $scope.init_job()
        if ($rootScope.usuario_logado.id_cliente) {
            $scope.lista_clientes_cliente($rootScope.usuario_logado.id_cliente)
        }
    }


    if ($route.current.originalPath == '/cliente/job/acompanhamento_atendimentos') {
        $scope.filtros = { etapa: 'chegada', data_atendimento: new Date() }
        $scope.lista_atendimento($scope.filtros)
        $scope.lista_atendimento_cliente = $interval(function () {
            $scope.lista_atendimento($scope.filtros)
        }, config.tempo_atualizacao_rotinas * 1000)

        $http({
            url: config.base_url + '/cliente_cliente/lista',
            method: 'POST',
        }).success(function (data, status) {
            $scope.clientes = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })


        $http({
            url: config.base_url + '/tipo_servico/distinto',
            method: 'GET',
        }).success(function (data, status) {
            console.log(data)
            $scope.tipo_servico = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })

    }

    $scope.adiciona = function (job, gd_adciona_detalha) {
        $scope.seta_gravar(true)
        $http({
            url: config.base_url + base_url_job,
            method: 'POST',
            data: job
        }).success(function (data, status) {
            $rootScope.adiciona_historico(data.msg, status)
            $scope.seta_gravar(false)
            if (gd_adciona_detalha) {
                $scope.muda_gd(data.id, $rootScope.usuario_logado.id_funcionario)
                $location.path('/job/detalha/' + data.id)
            }
            $scope.init_job()
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
            $scope.seta_gravar(false)
        })
    }

    $scope.carregar_notas = function (idJob) {
        $http({
            url: `/portal/job/${idJob}/nota/lista`,
            method: 'GET',
        }).success(function (data, status) {
            $scope.notas = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    // CARREGAR DADOS PARA O FILTRO DE TIPOS DE SERVIÇO
    if ($rootScope.usuario_logado.perfil == 'funcionario')
        $http({
            url: '/portal/tipo_servico/distinto',
            method: 'GET',
        }).success(function (data, status) {
            $scope.tipo_servico = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })

    $scope.dados_supporter_modal = function (item) {
        $scope.dados_supporter = item;
    }
})

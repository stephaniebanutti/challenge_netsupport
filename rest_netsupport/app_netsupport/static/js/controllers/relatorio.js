app.controller("relatorio", function ($scope, $http, $rootScope, config, $location, $timeout, $route, $routeParams){


    $scope.tipo_custo = 'ciclo'

    $scope.relatorio = []
    $scope.tipos_servicos = []
    $scope.relatorio_vendas = []
    $scope.faturamento_antigo_novo = {}
    $scope.pendencias_supporter = []

    $scope.total_jobs_relatorio = 0
    $scope.total_atendimentos_relatorio = 0

    $scope.filtros = {}
    $scope.filtro_otimizado = {}
    $scope.filtro_analise_jobs = {}

    $scope.reseta_relatorio = () => {
        $scope.relatorio_cadastro_doutores = {}
        $scope.relatorio_divulgacao = {}
    }
    $scope.trimestres =  ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre']
    $scope.meses =  ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro',
        'Outubro', 'Novembro', 'Dezembro']

    $scope.campos_extrato_pagamento_doutor = ['id_doutor', 'nome_doutor', 'cpf', 'razao_social', 'cnpj', 'nome_banco',
        'tipo_conta', 'codigo_banco', 'agencia_banco', 'dv_agencia_banco', 'conta_banco', 'dv_conta_banco',
        'operacao_conta', 'total_pagamento', 'titular_conta', 'email_doutor']
    
    $scope.relatorio_qtds_cadastro_doutores = function(relatorio){
        $scope.relatorio_cadastro_doutores = {total_doutores:0,total_doutores_com_pendencia:0}
        relatorio.forEach(function(item){
            $scope.relatorio_cadastro_doutores.total_doutores += item.total_doutores
            $scope.relatorio_cadastro_doutores.total_doutores_com_pendencia += item.total_doutores_com_pendencia
        })
    }

    $scope.relatorio_extrato_custos = relatorio => {
        $scope.qtds_relatorio_extrato_custos = {qtd_jobs:0,atendimentos:0,qtd_doutor:0,total_pagamentos:0}
        relatorio.forEach(function(item){
            $scope.qtds_relatorio_extrato_custos.qtd_jobs += item.qtd_jobs
            $scope.qtds_relatorio_extrato_custos.atendimentos += item.qtd_atendimento
            $scope.qtds_relatorio_extrato_custos.qtd_doutor += item.qtd_doutor
            $scope.qtds_relatorio_extrato_custos.total_pagamentos += item.total_geral_ciclo
        })
    }
    
    $scope.detalha_pendencias_doutor = function(id_doutor, filtro) {
        filtro['id_doutor'] = id_doutor
        let filtro_otimizado = $rootScope.otimiza_filtro(filtro)
        $http({
            url: config.base_url + '/relatorio/operacao/pendencia_doutor/detalha' ,
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status) {
            $scope.pendencias_supporter = data
        }).error(function(data, status) {
            $scope.pendencias_supporter = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_entrega_vendas = function (filtro) {
    	let filtro_otimizado = $rootScope.otimiza_filtro(filtro)

		$http({
            url: config.base_url + '/relatorio/vendas',
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status){
        	$scope.relatorio_vendas = data
            $scope.filtra_relatorio()
        })
        .error(function(data, status){
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.filtra_relatorio = function(filtro){
        if(filtro){
            if(filtro.pendencia)
                $scope.filtro.pendencia = filtro.pendencia != 'T' ? filtro.pendencia : ''
            if(filtro.etapa)
                $scope.filtro.etapa = filtro.etapa
        }

        if($scope.relatorio_vendas.length != 0){
            $scope.qtd_vendas = 0
            $scope.qtd_jobs = 0
            $scope.qtd_valor = 0.00
            $scope.relatorio_vendas_filtradas = []
            var teste
            $scope.relatorio_vendas.filter(function (item) {

				if(item.etapa.indexOf($scope.filtro.etapa) >= 0) {
					if($scope.filtro.pendencia != '') {
						if(angular.isArray(item.pendencia[$scope.filtro.etapa]))
							teste = item.pendencia[$scope.filtro.etapa].length > 0
						else
							teste = item.pendencia[$scope.filtro.etapa]

						if ($scope.filtro.pendencia == 'S' && teste) {
							$scope.qtd_jobs = $scope.qtd_jobs + item.jobs
							$scope.qtd_valor = $scope.qtd_valor + item.valor
							$scope.relatorio_vendas_filtradas.push(item)
						}else if($scope.filtro.pendencia == 'N' && !teste){
							$scope.qtd_jobs = $scope.qtd_jobs + item.jobs
							$scope.qtd_valor = $scope.qtd_valor + item.valor
							$scope.relatorio_vendas_filtradas.push(item)
						}
					}else{
						$scope.qtd_jobs = $scope.qtd_jobs + item.jobs
						$scope.qtd_valor = $scope.qtd_valor + item.valor
						$scope.relatorio_vendas_filtradas.push(item)
					}
                }
            })
            $scope.qtd_vendas = $scope.relatorio_vendas_filtradas.length
        }
    }

    $scope.filtra_cobertura = relatorio => {
        $scope.cidades_cobertura = 0
        relatorio.filter(item => {
            if(item.cobertura_total >= 1)
                $scope.cidades_cobertura++
        })
        $scope.cidades_cobertura_percentual = (($scope.cidades_cobertura / relatorio.length)*100).toFixed(2);
    }

    $scope.lista_historico_entrega_vendas = function(id_negocio, itens_pendentes) {
		$scope.venda_numero = id_negocio
		$scope.historico_entrega_vendas = []

        $http({
            url: config.base_url + '/relatorio/vendas/'+ id_negocio +'/atendimentos' ,
            method: 'GET'
        }).success(function(data, status) {
        	if(itens_pendentes) {
				data.filter(function (item) {
					if (itens_pendentes.indexOf(item.job) >= 0)
						item.com_pendencia = true
				})
			}
            $scope.historico_entrega_vendas = data

        }).error(function(data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.get_clientes = function () {
        $http({
            url: config.base_url + '/cliente/lista',
            method: 'POST',
        }).success(function(data, status_job) {
            $scope.clientes = data
        })
        .error(function (data, status_job) {
            $scope.clientes = []
            $rootScope.erro_portal(data, status_job)
        })
    }

    // GET PROJETOS
    $scope.get_projetos = function (clientes) {
        if(clientes!=[]) {
            let filtro = $rootScope.get_ids(clientes)
            $http({
                url: config.base_url + '/cliente_cliente',
                method: 'POST',
                data: filtro
            }).success(function (data, status_job) {
                data.filter(function (item) {
                    $scope.projetos.push(item)
                })
            })
            .error(function (data, status_job) {
                $scope.projetos = []
                $rootScope.erro_portal(data, status_job)
            })
        }
    }

	$scope.check_ano = true
	$scope.check_trimestre = true
    $scope.mostra_atendimento = true

	$scope.lista_margem_contribuicao = function (filtros) {
        let filtro = _.cloneDeep(filtros)
        filtro.id_cliente = $rootScope.get_ids(filtro.clientes)
        delete filtro.clientes

        $http({
            url: config.base_url + "/relatorio/financeiro/margem_contribuicao",
            method: 'POST',
            data: filtro
        }).success(function(data, status_job) {
            $scope.relatorio_margem = data
        })
        .error(function (data, status_job) {
            $rootScope.erro_portal(data, status_job)
        })
	}

    $scope.relatorio_demografico = function () {
        $http({
            url: config.base_url + "/relatorio/demografico",
            method: 'GET',
        }).success(function(data, status_job) {
            data.porcentagem_homens = parseFloat(data.total_homens * 100 / data.total_doutores).toFixed(1)
            data.porcentagem_mulheres = parseFloat(data.total_mulheres * 100 / data.total_doutores).toFixed(1)
            data.porcentagem_pcd = parseFloat(data.total_pcd * 100 / data.total_doutores).toFixed(1)
            $scope.demografico = data;
            var grafico = document.getElementById("grafico").getContext('2d');
            var graf = new Chart(grafico, {
                type: 'bar',
                data: {
                    labels: ["# Supporters", "# Candidatos", "# Cidades", "# Estados", "# Homens", "# Mulheres", "# PCD"],
                    datasets: [{
                        label: "Quantidades Totais",
                        data: [data.total_doutores, data.total_candidatos, data.total_cidades, data.total_estados, data.total_homens, data.total_mulheres, data.total_pcd],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
                }
            })
            var grafico2 = document.getElementById("grafico2").getContext('2d');
            var graf2 = new Chart(grafico2, {
                type: 'pie',
                data: {
                    labels: ["% Homens", "% Mulheres"],
                    datasets: [{
                        label: "Proporção Homem Mulheres",
                        data: [data.porcentagem_homens, data.porcentagem_mulheres],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                        ],
                        hoverBackgroundColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 0.2)',
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    tooltips: {
                        enabled: false,
                        custom: $rootScope.custom_tooltip('%')
                    }
                }
            })
            var grafico3 = document.getElementById("grafico3").getContext('2d');
            var graf3 = new Chart(grafico3, {
                type: 'pie',
                data: {
                    labels: ["% PCD", "% PSD"],
                    datasets: [{
                        label: "Proporção Pessoas Com Deficiência / Pessoas Sem Deficiência",
                        data: [data.porcentagem_pcd, 100 - data.porcentagem_pcd],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                        ],
                        hoverBackgroundColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 0.2)',
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    tooltips: {
                        enabled: false,
                        custom: $rootScope.custom_tooltip('%')
                    }
                }
            })

        })
        .error(function (data, status_job) {
            $scope.demografico = {}
            $rootScope.erro_portal(data, status_job)
        })
    }


    $scope.gera_divulgacao_jobs = function(filtros){
        let filtro_otimizado = $rootScope.otimiza_filtro(filtros)

        $http({
            url: config.base_url + "/relatorio/divulgacao_jobs",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status){
            $scope.relatorio_divulgacao_consolidado = {
                jobs_total: 0,
                jobs_divulgados: 0,
                jobs_direta: 0
            }
            data.forEach(function (item) {
                $scope.relatorio_divulgacao_consolidado.jobs_total += item.total_jobs
                $scope.relatorio_divulgacao_consolidado.jobs_divulgados += item.total_divulgado
                $scope.relatorio_divulgacao_consolidado.jobs_direta += item.total_jobs
            })
            $scope.relatorio_divulgacao = data
        })
        .error(function(data, status){
            $scope.relatorio_divulgacao = data
            $rootScope.erro_portal(data, status)
        })

    }

    $scope.gera_relatorio = function(filtro_param, relatorio, cb){
        $rootScope.seta_gravar(true)
        $scope.reseta_relatorio()
        let filtro = _.cloneDeep(filtro_param)

        if (filtro.periodo_selecionado){
            _.extend(filtro, $rootScope.get_inicio_fim(filtro.periodo_selecionado))
        }

        if(filtro.data_inicio)
            filtro.data_inicio = moment(filtro.data_inicio).format('YYYY-MM-DD');
        if(filtro.data_fim)
            filtro.data_fim = moment(filtro.data_fim).format('YYYY-MM-DD');

        if(filtro.status) {
            var itens = []
            for (var i = 0; i < filtro.status.length; i++)
                itens.push(filtro.status[i].valor)
            delete filtro.status
            filtro.status = itens
        }
        let str_filtro
        if (_.isEmpty(filtro))
            str_filtro = ""
        else
            str_filtro = "?" + $.param(filtro)
        $http({
            url: config.base_url + "/relatorio" + relatorio + str_filtro,
            method: 'GET'
        }).success(function (data, status) {
            $rootScope.seta_gravar(false)
            if (cb)
                cb(data)
            $scope.relatorio = data
            
        })
        .error(function (data, status) {
            $rootScope.seta_gravar(false)
            $scope.relatorio = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.gera_relatorio_post = function(filtro_param, endoint, cb){
        let filtro = _.cloneDeep(filtro_param)
        if (filtro.periodo_selecionado){
            _.extend(filtro, $rootScope.get_inicio_fim(filtro.periodo_selecionado))
            delete filtro.periodo_selecionado
        }

        if(filtro.data_inicio)
            filtro.data_inicio = moment(filtro.data_inicio).format('YYYY-MM-DD')
        if(filtro.data_fim)
            filtro.data_fim = moment(filtro.data_fim).format('YYYY-MM-DD')

        if(filtro.status) {
            var itens = []
            for (var i = 0; i < filtro.status.length; i++)
                itens.push(filtro.status[i].valor)
            delete filtro.status
            filtro.status = itens
        }

        if(filtro.tipo_servico) {
            var itens = []
            for (var i = 0; i < filtro.tipo_servico.length; i++)
                itens.push(filtro.tipo_servico[i].nome1)
            delete filtro.tipo_servico
            filtro.tipo_servico = itens
        }
        if(!filtro.id_cliente)
             delete filtro.id_cliente
        if(filtro.qtd_doutor < 0 || filtro.qtd_doutor == null)
             delete filtro.qtd_doutor
        if(!filtro.minimo_doutor)
             delete filtro.minimo_doutor
        if(!filtro.populacao_minima)
             delete filtro.populacao_minima
        $http({
            url: config.base_url + "/relatorio" + endoint,
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            if (cb)
                cb(data)
            $scope.relatorio = data
                $('#btn-gera-csv').prop('disabled',false)            
        })
        .error(function (data, status) {
            $scope.relatorio = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.relatorio_analise_jobs = function(filtros_form, endpoint, cb){
        let filtro = _.cloneDeep(filtros_form)
        if (filtro.tipo_data){
            if (filtro.data_inicio)
                filtro["data_"+filtro.tipo_data+"_inicial"] = moment(filtro.data_inicio).format('YYYY-MM-DD')
            if (filtro.data_fim)
                filtro["data_"+filtro.tipo_data+"_final"] = moment(filtro.data_fim).format('YYYY-MM-DD')
        }
        delete filtro["data_inicio"]
        delete filtro["data_fim"]
        $scope.gera_relatorio_post(filtro, endpoint, cb)
    }

    $scope.gera_csv_analise_job = (item,result) => {
        let csv = 'ID Job, Código Cliente, Contato Supporter, Nome Supporter, Cliente, cliente do Cliente, GD, Tipo serviço, Status, Local, Atend, Abertura, Atendimento, Fechamento\n'
        for(item of $scope.relatorio){
            const keys = Object.keys(item)
            keys.forEach(key =>{
                item[key]= item[key] || " "
            })
            csv += item.id_job +','+item.codigo_chamado_cliente+','+item.contato_doutor+
            ','+item.nome_doutor+','+item.nome_cliente+','+item.nome_cliente_cliente+','+item.nome_gestor+
            ','+item.nome_tipo_servico+','+item.status_job+','+item.cidade+','+item.total_atendimentos_job+
            ','+item.dh_abertura+','+item.dh_atendimento+','+item.dh_fechamento+'\n'
        }
        return  encodeURIComponent(csv)
    }

    $scope.gera_csv_financeiro = (item) => {
        let csv = 'ID, Nome, Emaill, CPF, Razao Social, CNPJ, Banco, Titular da Conta, Tipo, Código, Agência, DV, Conta, Operação, Valor\n'
        for(item of $scope.relatorio.pagamentos){
            const keys = Object.keys(item)
            keys.forEach(key =>{
                item[key]= item[key] || " "
            })
            let cpf_mask = item.cpf.replace(/(.{3})(.{3})(.{3})(.{1,2})/, '$1.$2.$3-$4')
            let cnpj_mask = item.cnpj.replace(/(.{2})(.{3})(.{3})(.{4})(.{1,2})/, '$1.$2.$3/$4-$5')
            let conta_banco_mask = item.conta_banco.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            let total_pagamento_mask = item.total_pagamento.toFixed(2).replace('.', '.').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            csv += item.id_doutor +','+item.nome_doutor+','+item.email_doutor+
            ','+cpf_mask+','+item.razao_social+','+cnpj_mask+','+item.nome_banco+
            ','+item.titular_conta+','+item.tipo_conta+','+item.codigo_banco+','+item.agencia_banco+
            ','+item.dv_agencia_banco+','+conta_banco_mask+'-'+item.dv_conta_banco+','+item.operacao_conta+','+total_pagamento_mask+'\n'         
        }
        return encodeURIComponent(csv)
    }

    $scope.gera_relatorio_otimizado = function(filtros, endoint, cb){
        $http({
            url: config.base_url + "/relatorio" + endoint,
            method: 'POST',
            data: $rootScope.otimiza_filtro(filtros)
        }).success(function (data, status) {
            if (cb)
                cb(data)
            $scope.relatorio = data
        })
        .error(function (data, status) {
            $scope.relatorio = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_cliente = function(){
        $http({
            url: config.base_url + "/cliente/lista",
            method: 'POST'
        }).success(function(data, status){
            data.splice(0, 0, {id: undefined, nome_cliente: "SELECIONE"})
            $scope.clientes = data
        })
        .error(function(data, status){
            $scope.clientes = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_tipo_servico = function(){
        $http({
            url: config.base_url + "/tipo_servico/distinto",
            method: 'GET'
        }).success(function(data, status){
            data.splice(0, 0, {nome1: undefined, nome2: "SELECIONE"})
            $scope.tipos_servicos = data
        })
        .error(function(data, status){
            $scope.tipos_servicos = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.detalha_faturamento_antigo_novo = function (id_job) {
        $http({
            url: config.base_url + "/relatorio/financeiro/fechamento_antigo/" + id_job,
            method: 'GET'
        }).success(function(data, status){
            $scope.faturamento_antigo_novo = data
        })
        .error(function(data, status){
            $scope.faturamento_antigo_novo = {}
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_gestor = function(insere_seleciona){
        let filtros = {
            id_grupo: 3
        }
        $http({
            url: config.base_url + '/funcionario/lista',
            method: 'POST',
            data: filtros
        }).success(function(data, status){
            if(!insere_seleciona)
                data.splice(0, 0, {id: undefined, nome: "SELECIONE"})
            $scope.gestor_demanda = data
        })
        .error(function(data, status){
            $scope.gestor_demanda = []
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.lista_cidade_brasil = function(filtro_cidade_brasil) {
        $http({
            url: config.base_url + '/cidade_brasil' ,
            method: 'POST',
            data: {estado: filtro_cidade_brasil}
        }).success(function(data, status) {
            data.splice(0, 0, {id: undefined, cidade: "SELECIONE"})
            $scope.cidade_brasil = data
        }).error(function(data, status) {
            $rootScope.erro_portal(data, status)
            $scope.cidade_brasil = []
        })
    }



    /** ==============
    * LISTA BUSCA
    ==============**/
    $scope.lista_busca_doutor = (filtro_busca_doutor) => {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtro_busca_doutor)
        $http({
            url: config.base_url + "/doutor/lista",
            method: 'POST',
            data: filtro_otimizado
        }).success(function(data, status){
            $scope.doutores = data
        })
        .error(function(data, status){
            $scope.doutores = []
            $rootScope.erro_portal(data, status)
        })
    }
    $scope.seleciona_doutor = function(doutor){
        if(doutor.selecionado) {
            doutor.selecionado = false
            $scope.filtros.id_doutor = null
            $scope.filtro_otimizado.id_doutor = null
            $scope.doutor_selecionado = ''
        }
        else{
            $scope.doutores.filter(function (item) {
               return item.selecionado = false
            })
            doutor.selecionado = true
            $scope.filtros.id_doutor = doutor.id
            $scope.filtro_otimizado.id_doutor = doutor.id
            $scope.doutor_selecionado = doutor.nome
        }
    }
    $scope.lista_busca_cliente = (filtro_busca_cliente) => {
        let filtro_otimizado = $rootScope.otimiza_filtro(filtro_busca_cliente)
        // filtro_otimizado["status"] = "ativo"
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
    $scope.seleciona_cliente = function(cliente){
        if(cliente.selecionado) {
            cliente.selecionado = false
            $scope.filtros.id_cliente = null
            $scope.cliente_selecionado = ''
        }
        else{
            $scope.clientes.filter(function (item) {
               return item.selecionado = false
            })
            cliente.selecionado = true
            $scope.filtros.id_cliente = cliente.id
            $scope.cliente_selecionado = cliente.nome_cliente
        }
    }

    function get_datas(dados){
        let datas = []
        dados.forEach(function(dado){
            datas.push(inverte_data(dado.dt_previsao_pagamento, '-', '/'))
        })
        return datas
    }

    function get_programados(dados){
        let programados = []
        dados.forEach(function(dado){
            programados.push(dado.total_pagamento)
            $scope.total_pagamentos_programados += dado.total_pagamento
            $scope.total_pagamentos += dado.total_pagamento
        })
        return programados
    }

    function get_atrasados(dados){
        let atrasados = []
        dados.forEach(function(dado){
            atrasados.push(dado.atrasados)
            $scope.total_pagamentos_atrasados += dado.atrasados
            $scope.total_pagamentos += dado.atrasados
        })
        return atrasados
    }

    function get_pendentes(dados){
        let pendentes = []
        dados.forEach(function(dado){
            pendentes.push(dado.total_pendente)
            $scope.total_pagamentos_pendentes += dado.total_pendente
            $scope.total_pagamentos += dado.total_pendente
        })
        return pendentes
    }

    function gera_grafico_previsao_pagamento(dados){
        $scope.total_pagamentos_programados = 0
        $scope.total_pagamentos_atrasados = 0
        $scope.total_pagamentos_pendentes = 0
        $scope.total_pagamentos = 0
        var grafico = document.getElementById("grafico").getContext('2d');
        var graf = new Chart(grafico, {
            type: 'bar',
            data: {
                labels: get_datas(dados),
                datasets: [{
                    label: "Programados",
                    data: get_programados(dados),
                    backgroundColor: "blue",
                    stack: "background"
                },{
                    label: "Projeção",
                    data: get_pendentes(dados),
                    backgroundColor: "yellow",
                    stack: "background"
                },{
                    label: "Atrasados",
                    data: get_atrasados(dados),
                    backgroundColor: "red",
                    stack: "background"
                }]
            },
            options: {
                    scales: {
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                beginAtZero:true
                            }
                        }],
                        xAxes: [{
                            stacked: true,
                        }],
                    },
                    legend: {
                        position: 'bottom'
                    }

                }
            })
    }

    if($route.current.originalPath == '/relatorio/operacao/atendimento/supporter') {
        $scope.lista_tipo_servico()
        $scope.lista_cliente()
    }
    if($route.current.originalPath == '/relatorio/operacao/analise_job') {
        $scope.lista_tipo_servico()
        $scope.lista_gestor()
    }

    if($route.current.originalPath == '/relatorio/entrega_vendas') {
    }

    if($route.current.originalPath == '/relatorio/margem_contribuicao') {
    	$scope.get_clientes()
    }

    if($route.current.originalPath == '/relatorio/demografico') {
        $scope.relatorio_demografico()
    }

    if($route.current.originalPath == '/relatorio/financeiro/previsao_pagamento') {
        $scope.gera_relatorio("", "/financeiro/previsao_pagamento", gera_grafico_previsao_pagamento)
    }
})

app.controller("financeiro", function ($scope, $rootScope, $http, $location, config, $timeout, $route, $routeParams, Upload) {

    $scope.get_faturamento = function (filtro_param, endpoint, cb) {
        let filtro = _.cloneDeep(filtro_param)

        if (filtro && filtro.tipo_data) {
            if (filtro.data_inicio) {
                filtro["data_" + filtro.tipo_data + "_inicial"] = moment(filtro.data_inicio).format('YYYY-MM-DD')
                delete filtro["data_inicio"]
            }
            if (filtro.data_fim) {
                filtro["data_" + filtro.tipo_data + "_final"] = moment(filtro.data_fim).format('YYYY-MM-DD')
                delete filtro["data_fim"]
            }
        } else {
            filtro = {}
        }

        $http({
            url: config.base_url + endpoint,
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            if (cb)
                cb(data)
            $scope.relatorio = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.get_faturamento_detalha = (filtro_param, endpoint, cliente) => {
        $scope.relatorio_detalha = []
        $scope.cliente_faturamento_detalha = cliente
        let filtro = _.cloneDeep(filtro_param)
        filtro.id_cliente = cliente.id_cliente

        if (filtro.tipo_data) {
            if (filtro.data_inicio) {
                filtro["data_" + filtro.tipo_data + "_inicial"] = moment(filtro.data_inicio).format('YYYY-MM-DD')
                delete filtro["data_inicio"]
            }
            if (filtro.data_fim) {
                filtro["data_" + filtro.tipo_data + "_final"] = moment(filtro.data_fim).format('YYYY-MM-DD')
                delete filtro["data_fim"]
            }
        }

        $http({
            url: config.base_url + '/' + endpoint,
            method: 'POST',
            data: filtro
        }).success(function (data, status) {
            $scope.relatorio_detalha = data
        })
            .error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
    }

    $scope.gera_csv_faturamento = () => {

        if ($scope.relatorio_detalha && $scope.relatorio_detalha.jobs) {
            let csv = 'Id, Cliente do Cliente, Tipo Servico, Data Inicial, Data Final, Job, Hora Adicional, Código do cliente, Reembolso, Total\n'
            for (const item of $scope.relatorio_detalha.jobs) {

                const keys = Object.keys(item)
                keys.forEach(key => {
                    item[key] = item[key] || " "
                })
                csv += item.id_job + ',' + item.nome_cliente_cliente + ',' + item.tipo_servico + ',' + item.data_inicial +
                    ',' + item.data_final + ',' + item.total_atendimento + ',' + item.total_horas_extras + ',' + item.codigo_chamado_cliente +
                    ',' + item.total_reembolso + ',' + item.total_job + '\n'
            }
            return encodeURIComponent(csv)
        }
    }

    $scope.get_analise_receita = function (filtros_form, endpoint, cb) {
        let filtro = _.cloneDeep(filtros_form)
        if (filtro.tipo_data) {
            if (filtro.data_inicio) {
                filtro["data_" + filtro.tipo_data + "_inicial"] = moment(filtro.data_inicio).format('YYYY-MM-DD')
                delete filtro["data_inicio"]
            }
            if (filtro.data_fim) {
                filtro["data_" + filtro.tipo_data + "_final"] = moment(filtro.data_fim).format('YYYY-MM-DD')
                delete filtro["data_fim"]
            }
        }
        $http({
            url: config.base_url + endpoint,
            method: 'POST',
            data: filtro
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

    function get_lista_campo(lista_obj, campo) {
        return lista_obj.map(function (obj) {
            return obj[campo]
        })
    }

    function get_porcentagem_faturamento(lista_obj, fat_total) {
        return lista_obj.map(function (obj) {
            return (obj["total_faturamento_fechado"] * 100 / fat_total).toFixed(1)
        })
    }

    function get_cores(qtd) {
        return palette('mpn65', qtd).map(function (cor) {
            return "#" + cor
        })
    }

    $scope.gera_graficos_analise_receita = function (dados) {
        let total_faturamento = dados.total_faturamento_fechado + dados.total_faturamento_pendente +
            dados.total_faturamento_finalizado
        if (dados.faturamentos_clientes) {
            gera_grafico_composicao_receita(dados.faturamentos_clientes)
            gera_grafico_distribuicao_receita(dados.faturamentos_clientes, total_faturamento)
        }
    }

    var g_composicao_receita = null

    function gera_grafico_composicao_receita(dados) {
        var grafico = document.getElementById("grafico1").getContext('2d');
        if (g_composicao_receita)
            g_composicao_receita.destroy()
        g_composicao_receita = new Chart(grafico, {
            type: 'bar',
            data: {
                labels: get_lista_campo(dados, 'nome_cliente'),
                datasets: [{
                    label: "Fechada",
                    data: get_lista_campo(dados, 'total_faturamento_fechado'),
                    backgroundColor: "blue",
                    stack: "background"
                }, {
                    label: "Pronta",
                    data: get_lista_campo(dados, 'total_faturamento_atrasado'),
                    backgroundColor: "yellow",
                    stack: "background"
                },
                {
                    label: "Pendente",
                    data: get_lista_campo(dados, 'total_faturamento_pendente'),
                    backgroundColor: "red",
                    stack: "background"
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Composição Receita"
                },
                scales: {
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            stepSize: 1,
                            min: 0,
                            autoSkip: false
                        },
                    }],
                },
                legend: {
                    position: 'bottom'
                },
            }
        })
    }

    var g_distribuico_receita = null

    function gera_grafico_distribuicao_receita(dados, total_faturamento) {
        var grafico = document.getElementById("grafico2").getContext('2d')
        if (g_distribuico_receita != null) {
            g_distribuico_receita.destroy()
        }
        g_distribuico_receita = new Chart(grafico, {
            type: 'pie',
            data: {
                labels: get_lista_campo(dados, 'nome_cliente'),
                datasets: [{
                    data: get_lista_campo(dados, 'total_faturamento'),
                    backgroundColor: get_cores(dados.length)
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Distribuição Receita"
                },
                legend: {
                    position: 'right'
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var dataset = data.datasets[tooltipItem.datasetIndex]

                            var total = dataset.data.reduce(function (saldo, valor_atual) {
                                return saldo + valor_atual
                            })
                            var valor_atual = dataset.data[tooltipItem.index];
                            var porcento = (valor_atual / total * 100).toFixed(1) + "%";

                            return porcento
                        }
                    }
                },
            }
        })
    }

})

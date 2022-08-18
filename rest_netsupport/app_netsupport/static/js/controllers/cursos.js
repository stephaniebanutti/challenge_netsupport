
app.controller("cursos", function ($scope, $rootScope, $http, config, $routeParams, $route) {

    $scope.curso = JSON.parse(localStorage.getItem('curso')) || {}
    $scope.cursos = []
    $scope.clientes = []
    $scope.cliente_cliente = []
    $scope.tipos_atendimento = [{ id: 1, nome: 'Alocação' }, { id: 2, nome: 'Atendimento' }]
    $scope.tipos_servico = []

    // CHECKA SE TODOS OS ITENS DA LISTA FORAM SELECIONADOS
    $scope.check = {
        clientes: false,
        cliente_cliente: false,
        tipos_atendimento: false,
        tipos_servico: false
    }

    // PAYLOAD DE COMBO PARA ENVIAR (GRAVAR)
    $scope.payload = {
        conclusao_obrigatoria: $scope.curso.conclusao_obrigatoria,
        status: $scope.curso.status === 'Em Uso' ? true : false,
        clientes: [],
        cliente_cliente: [],
        tipos_atendimento: [],
        tipos_servico: [],
    }

    /* TELA /cursos */
    $scope.lista = function () {

        $http({
            url: config.base_url + "/dependencia_curso/lista",
            method: 'GET'
        }).success(function (data) {
            $scope.cursos = data
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    $scope.salvar_curso = function (curso) {
        $scope.curso = curso
        localStorage.setItem('curso', JSON.stringify(curso))
    }

    $scope.apagarCurso = function ({ id }) {
        $http({
            url: config.base_url + "/dependencia_curso/" + id,
            method: 'DELETE'
        }).success(function (data) {
            $scope.cursos = $scope.cursos.filter(e => e.id != id)
        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }


    /* TELA /cursos/:id_curso */
    $scope.detalha = function () {
        $http({
            url: config.base_url + "/cliente/lista/cliente_cliente",
            method: 'GET'
        }).success(function (data) {

            $scope.clientes = data;
            let jaAdd = []

            // carregar todos atributos ja alterados
            for (var i in $scope.clientes) {
                const cliente = $scope.clientes[i]

                // REMARCANDO CLIENTES
                if (Array.isArray($scope.curso.clientes)) {

                    if ($scope.curso.clientes.length === 0) {
                        $scope.check.clientes = true
                        $scope.adiciona_todos('clientes')
                    }

                    if ($scope.curso.clientes.length > 0 && $scope.curso) {
                        for (let index in $scope.curso.clientes) {
                            if ($scope.curso.clientes[index] == cliente.id) $scope.adiciona(cliente, 'clientes')

                        }
                    }

                }


                // POPULA CLIENTES DOS CLIENTES
                if (Array.isArray($scope.curso.clientes_dos_clientes)) {

                    if ($scope.curso.clientes_dos_clientes.length === 0) {
                        $scope.check.cliente_cliente = true
                        $scope.adiciona_todos('cliente_cliente')
                    }

                    if ($scope.curso.clientes_dos_clientes.length > 0) {
                        for (let ci in cliente.clientes) {
                            for (let idCC of $scope.curso.clientes_dos_clientes) {
                                if (idCC == cliente.clientes[ci].id) {
                                    cliente.clientes[ci].id_cliente = cliente.id
                                    $scope.adiciona(cliente.clientes[ci], 'cliente_cliente')
                                }
                            }
                        }
                    }

                }


                // POPULA TIPOS DE SERVICO
                for (const ts of $scope.tipos_servico)
                    if (Array.isArray($scope.curso.tipo_servico))
                        for (let nomeTS of $scope.curso.tipo_servico)
                            if (nomeTS == ts.nome && !jaAdd.includes(nomeTS)) {
                                jaAdd.push(nomeTS)
                                $scope.adiciona(ts, 'tipos_servico')
                            }

                if (Array.isArray($scope.curso.tipo_servico) && $scope.curso.tipo_servico.length === 0) {
                    $scope.check.tipos_servico = true
                    $scope.adiciona_todos('tipos_servico')
                }

            }

            if ($scope.curso.tipo_atendimento.length == 0) {
                $scope.check.tipos_atendimento = true
                $scope.adiciona_todos('tipos_atendimento')
            }
            if ($scope.curso.tipo_atendimento == 'alocacao') {
                $scope.adiciona({ id: 1, nome: 'Alocação' }, 'tipos_atendimento')
                $scope.tipos_atendimento[0].active = true
            }

            if ($scope.curso.tipo_atendimento == 'atendimento') {

                $scope.adiciona({ id: 2, nome: 'Atendimento' }, 'tipos_atendimento')
                $scope.tipos_atendimento[1].active = true
            }

            $scope.cliente_cliente = $scope.cliente_cliente
            $scope.tipos_atendimento = $scope.tipos_atendimento
            $scope.tipos_servico = $scope.tipos_servico

        }).error(function (data, status) {
            $rootScope.erro_portal(data, status)
        })
    }

    // ADD TODOS OS ITENS DO COMBO
    $scope.adiciona_todos = function (attr) {
        if (attr) {
            /* $scope.check[attr] = !$scope.check[attr] */
            if (!$scope.check[attr]) {
                for (const item of $scope[attr]) $scope.remove(item, attr)
            } else {
                for (const item of $scope[attr]) $scope.adiciona(item, attr, true)
            }
        }
    }

    // ADD UM ITEM AO PAYLOAD
    $scope.adiciona = function (item, attr, all) {

        if (!item.active || all) {
            //ADICIONA
            item.active = true


            let existe = false
            for (const it of $scope.payload[attr]) {
                if (it.id == item.id) existe = true
            }
            if (!existe) {

                $scope.payload[attr].push(item)
            }




            // BUSCA CLIENTE_CLIENTE
            if (attr == 'clientes') {
                if (item.clientes) {
                    for (const cliente of item.clientes) {
                        let existe = false
                        for (const tss of $scope.cliente_cliente) {
                            if (tss.id == cliente.id) existe = true
                        }
                        if (!existe) {
                            cliente.id_cliente = item.id
                            $scope.cliente_cliente.push(cliente)
                        }

                    }
                }
                if (item.tipos_servico)
                    for (const ts of item.tipos_servico) {
                        let existe = false
                        for (const tss of $scope.tipos_servico) {
                            if (tss.id == ts.id) existe = true
                        }
                        if (!existe) $scope.tipos_servico.push(ts)
                    }
            }

        } else {
            $scope.remove(item, attr)
        }
    }

    $scope.remove = function (item, attr) {

        // REMOVE
        item.active = false
        $scope.check[attr] = false
        $scope.payload[attr] = $scope.payload[attr].filter(e => e.id != item.id)

        if (attr == 'clientes') {
            $scope.cliente_cliente = $scope.cliente_cliente.filter(e => e.id_cliente != item.id)
            $scope.payload.cliente_cliente = $scope.payload.cliente_cliente.filter(e => e.id_cliente != item.id)

            $scope.tipos_servico = []
            $scope.payload.tipos_servico = []


            for (const cliente of $scope.payload.clientes) {
                for (const ts of cliente.tipos_servico) {
                    var existe = false
                    for (const tss of $scope.tipos_servico) {
                        if (tss.id == ts.id) existe = true
                    }
                    if (!existe) $scope.tipos_servico.push(ts)

                }
            }
            $scope.tipos_servico = $scope.tipos_servico

            let jaAdd = []
            for (const ts of $scope.tipos_servico) {
                if (Array.isArray($scope.curso.tipo_servico)) {
                    for (let nomeTS of $scope.curso.tipo_servico) {
                        if (nomeTS == ts.nome && !jaAdd.includes(nomeTS)) {
                            jaAdd.push(nomeTS)
                            ts.active = false
                            $scope.adiciona(ts, 'tipos_servico')
                        }
                    }
                }

            }


            //$scope.$apply(function () { $scope.tipos_servico = $scope.tipos_servico })


        }
    }

    $scope.gravar = function () {

        let erro = false

        if (!$scope.check.tipos_servico && $scope.payload.tipos_servico.length === 0) {
            erro = true
            $rootScope.mostra_mensagem('erro', 'Necessário selecionar algum Tipo de Serviço')
        }
        if (!$scope.check.tipos_atendimento && $scope.payload.tipos_atendimento.length === 0) {
            erro = true
            $rootScope.mostra_mensagem('erro', 'Necessário selecionar algum Tipo de atendimento')
        }
        if (!$scope.check.cliente_cliente && $scope.payload.cliente_cliente.length === 0 && $scope.cliente_cliente.length > 0) {
            erro = true
            $rootScope.mostra_mensagem('erro', 'Necessário selecionar algum Cliente de Cliente')
        }
        if (!$scope.check.clientes && $scope.payload.clientes.length === 0) {
            erro = true
            $rootScope.mostra_mensagem('erro', 'Necessário selecionar algum Cliente')
        }

        let ta = []
        if ($scope.payload.tipos_atendimento.length == 1) {
            if ($scope.payload.tipos_atendimento[0].nome == 'Alocação') {
                ta.push('alocacao')
            } else {
                ta.push('atendimento')
            }
        }
        if (!erro) {
            var data = {
                clientes: [],
                clientes_dos_clientes: [],
                tipo_atendimento: ta,
                tipo_servico: [],
                conclusao_obrigatoria: $scope.payload.conclusao_obrigatoria,
                status: $scope.payload.status ? 'Em Uso' : 'Sem Uso',
                etag: $scope.curso.etag

            }
            if ($scope.payload.clientes.length > 0 && $scope.payload.clientes.length < $scope.clientes.length)
                for (let cliente of $scope.payload.clientes) data.clientes.push(cliente.id)
            if ($scope.payload.cliente_cliente.length > 0 && $scope.payload.cliente_cliente.length < $scope.cliente_cliente.length)
                for (let cliente of $scope.payload.cliente_cliente) data.clientes_dos_clientes.push(cliente.id)
            if ($scope.payload.tipos_servico.length > 0 && $scope.payload.tipos_servico.length < $scope.tipos_servico.length)
                for (let ts of $scope.payload.tipos_servico) data.tipo_servico.push(ts.nome)


            $http({
                url: config.base_url + "/dependencia_curso/" + $routeParams.id_curso,
                method: 'PUT',
                data: data
            }).success(function (data) {
                $rootScope.mostra_mensagem('sucesso', 'Dependencia de curso gravado com sucesso');
                window.location = '/#/cursos'
            }).error(function (data, status) {
                $rootScope.erro_portal(data, status)
            })
        }
    }


    // ROTEAMENTO
    if ($route.current.originalPath == '/cursos')
        $scope.lista()
    if ($route.current.originalPath == '/cursos/:id_curso')
        $scope.detalha($routeParams.id_curso)


})

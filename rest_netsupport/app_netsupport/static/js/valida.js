const soma = (total, valor_atual) => total + valor_atual
const multiplica_d1 = (valor_atual, indice) => valor_atual * digitos[indice]
const multiplica_d2 = (valor_atual, indice) => valor_atual * digitos[indice+1]
const re_data_inv = /^\d{4}-\d{2}-\d{2}$/
const re_dh_inv = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/
const re_digitos = /^[\d]+$/
const re_nao_digitos = /[^\d]/g
const re_nome_discourse = /^\w+$/
const re_email = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/
const re_hora = /^\d{2}:\d{2}(:\d{2})?$/
const re_str_espaco_acento_numero = /^[a-z0-9áéíóúçãõàâêô\-_\. ]+$/i
const re_str_espaco_acento_numero_linha = /^[a-z0-9áéíóúçãõàâêô\-_\.\/:,\n\/# ]+$/i
const re_numero_letra_traco_ponto = /^[a-z0-9\.\-]+$/i
const re_valida_token = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/

const unidades_data = {
    d: 24*3600*1000,
    h: 3600*1000,
    m: 60*1000,
    s: 1000
}

function inverte_data(data, separador, novo_separador){
    return data.split(separador).reverse().join(novo_separador)
}

function inverte_data_hora(dh, separador, novo_separador){
    var [data, hora] = dh.split(/[T ]/)
    return inverte_data(data, separador, novo_separador)+" "+hora
}



app.directive('cep', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '=',
            buscaCEP: '&',
            focusSucesso: '@',
            focusFalha: '@'
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_cep)
            ngModel.$formatters.push(formata_cep)

            function remove_formatos(valor){
                return valor.replace(/[^\d]/g, '')
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_cep(modelValue))
                ngModel.$render()
            }

            function valida_cep(viewValue){

                if (!viewValue){
                        ngModel.$setValidity('cep', true)
                        return viewValue
                }
                var modelValue = remove_formatos(viewValue)
                atualiza_view(modelValue)

                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('cep', true)
                        return modelValue
                    }
                }
                if (modelValue.length != 8){
                    ngModel.$setValidity('cep', false)
                    return modelValue
                }
                ngModel.$setValidity('cep', true)
                return modelValue
            }

            function formata_cep(modelValue){
                if (modelValue){
                    switch(modelValue.length){
                        case 1:
                        case 2: return modelValue
                        case 3:
                        case 4:
                        case 5:return modelValue.replace(/(.{2})(.{1,3})/, '$1.$2')
                        default: return modelValue.replace(/(.{2})(.{3})(.{1,3})/, '$1.$2-$3')
                    }
                }
                return modelValue
            }
        }
    }
})

app.directive('cpf', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_cpf)
            ngModel.$formatters.push(formata_cpf)

            function remove_formatos(valor){
                return valor.replace(/[^\d]/g, '')
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_cpf(modelValue))
                ngModel.$render()
            }

            function valida_cpf(viewValue){

                if (!viewValue){
                    ngModel.$setValidity('cpf', true)
                    return viewValue
                }
                var modelValue = remove_formatos(viewValue)
                atualiza_view(modelValue)

                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('cpf', true)
                        return modelValue
                    }
                }
                if (modelValue.length != 11 || modelValue == '00000000000'){
                    ngModel.$setValidity('cpf', false)
                    return modelValue
                }
                var peso_cpf = [1, 2, 3, 4, 5, 6, 7, 8, 9]
                var digitos = modelValue.split("").map(Number)
                const multiplica_d1 = (valor_atual, indice) => valor_atual * digitos[indice]
                var digito1 = peso_cpf.map(multiplica_d1).reduce(soma, 0) % 11 %10
                if (digito1 != digitos[9]){
                    ngModel.$setValidity('cpf', false)
                    return modelValue
                }
                const multiplica_d2 = (valor_atual, indice) => valor_atual * digitos[indice+1]
                var digito2 = peso_cpf.map(multiplica_d2).reduce(soma, 0) % 11 %10
                if (digito2 != digitos[10]){
                    ngModel.$setValidity('cpf', false)
                    return modelValue
                }
                ngModel.$setValidity('cpf', true)
                return modelValue
            }

            function formata_cpf(modelValue){
                if (modelValue){
                    switch(modelValue.length){
                        case 1:
                        case 2:
                        case 3: return modelValue
                        case 4:
                        case 5:
                        case 6: return modelValue.replace(/(.{3})(.{1,3})/, '$1.$2')
                        case 7:
                        case 8:
                        case 9: return modelValue.replace(/(.{3})(.{3})(.{1,3})/, '$1.$2.$3')
                        default: return modelValue.replace(/(.{3})(.{3})(.{3})(.{1,2})/, '$1.$2.$3-$4')
                    }
                }
                return modelValue
            }
        }
    }
})

app.directive('cnpj', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_cnpj)
            ngModel.$formatters.push(formata_cnpj)

            function remove_formatos(valor){
                return valor.replace(/[^\d]/g, '')
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_cnpj(modelValue))
                ngModel.$render()
            }

            function valida_cnpj(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('cnpj', true)
                        return viewValue
                }
                var modelValue = remove_formatos(viewValue)
                atualiza_view(modelValue)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('cnpj', true)
                        return modelValue
                    }
                }
                if (modelValue.length != 14 || modelValue == '00000000000000'){
                    ngModel.$setValidity('cnpj', false)
                    return modelValue
                }

                var peso_digito1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
                var peso_digito2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
                var digitos = modelValue.split("").map(Number)
                const multiplica_d1 = (valor_atual, indice) => valor_atual * digitos[indice]
                var digito1 = peso_digito1.map(multiplica_d1).reduce(soma, 0) % 11
                if (digito1 < 2)
                    digito1 = 0
                else
                    digito1 = 11 - digito1
                if (digito1 != digitos[12]){
                    ngModel.$setValidity('cnpj', false)
                    return modelValue
                }
                const multiplica_d2 = (valor_atual, indice) => valor_atual * digitos[indice+1]
                var digito2 = peso_digito2.map(multiplica_d1).reduce(soma, 0) % 11
                if (digito2 < 2)
                    digito2 = 0
                else
                    digito2 = 11 - digito2
                if (digito2 != digitos[13]){
                    ngModel.$setValidity('cnpj', false)
                    return modelValue
                }

                ngModel.$setValidity('cnpj', true)
                return modelValue
            }

            function formata_cnpj(modelValue){
                if (modelValue){
                    switch(modelValue.length){
                        case 1:
                        case 2: return modelValue
                        case 3:
                        case 4:
                        case 5: return modelValue.replace(/(.{2})(.{1,3})/, '$1.$2')
                        case 6:
                        case 7:
                        case 8: return modelValue.replace(/(.{2})(.{3})(.{1,3})/, '$1.$2.$3')
                        case 9:
                        case 10:
                        case 11:
                        case 12: return modelValue.replace(/(.{2})(.{3})(.{3})(.{1,4})/, '$1.$2.$3/$4')
                        default: return modelValue.replace(/(.{2})(.{3})(.{3})(.{4})(.{1,2})/, '$1.$2.$3/$4-$5')
                    }
                }
                return modelValue
            }
        }
    }
})

app.directive('conta', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_conta)
            ngModel.$formatters.push(formata_conta)

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_conta(modelValue))
                ngModel.$render()
            }

            function valida_conta(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('conta', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('conta', true)
                        return null
                    }
                }

                var modelValue = viewValue.replace(/[^\d]/gi, '')
                atualiza_view(modelValue)

                if (/^\d+$/.test(modelValue)){
                    ngModel.$setValidity('conta', true)
                    return modelValue
                }
                else{
                    ngModel.$setValidity('conta', false)
                    return null
                }

            }

            function formata_conta(modelValue){
                if (!modelValue || modelValue.length == 1)
                    return modelValue

                return modelValue.split("")
                            .reverse()
                            .join("")
                            .replace(/(\d{3})/g, '$1.')
                            .replace(/\.$/, '')
                            .split("")
                            .reverse()
                            .join("")
            }
        }
    }
})

app.directive('contaDv', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_conta_dv)
            ngModel.$formatters.push(formata_conta_dv)

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_conta_dv(modelValue))
                ngModel.$render()
            }

            function valida_conta_dv(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('conta_dv', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('conta_dv', true)
                        return null
                    }
                }

                var modelValue = viewValue.replace(/[^\dx]/gi, '')
                atualiza_view(modelValue)

                if (/^[\dx]$/gi.test(modelValue)){
                    ngModel.$setValidity('conta_dv', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('conta_dv', false)
                    return null
                }

            }

            function formata_conta_dv(modelValue){
                return modelValue
            }
        }
    }
})

app.directive('data', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            diferencaMaiorQue: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_data)
            ngModel.$formatters.push(formata_data)

            function remove_formatos(valor){
                return valor.replace(/[^\d]/g, '')
            }

            function formata_view(somenteNumeros){
                if (somenteNumeros){
                    switch(somenteNumeros.length){
                        case 1:
                        case 2: return somenteNumeros
                        case 3:
                        case 4: return somenteNumeros.replace(/(.{2})(.{1,2})/, '$1/$2')
                        default: return somenteNumeros.replace(/(.{2})(.{2})(.{1,4})/, '$1/$2/$3')
                    }
                }
                return somenteNumeros
            }

            function atualiza_view(somenteNumeros){
                ngModel.$setViewValue(formata_view(somenteNumeros))
                ngModel.$render()
            }

            function valida_data(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('data', true)
                        return null
                }
                var somenteNumeros = remove_formatos(viewValue)
                atualiza_view(somenteNumeros)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('data', true)
                        return null
                    }
                }
                if (somenteNumeros.length != 8){
                    ngModel.$setValidity('data', false)
                    return null
                }

                var modelValue = somenteNumeros.replace(/(.{2})(.{2})(.{4})/, '$3-$2-$1')

                var data = Date.parse(modelValue)
                if (isNaN(data) || !re_data_inv.test(modelValue)){
                    ngModel.$setValidity('data', false)
                    return null
                }
                else
                    ngModel.$setValidity('data', true)

                if (scope.diferencaMaiorQue){
                    var hoje = Date.now()
                    var [tempo, unidade] = scope.diferencaMaiorQue.split(" ")
                    if (hoje - data > parseInt(tempo)*unidades_data[unidade]){
                        ngModel.$setValidity('dt_diferenca_maior_que', true)
                        return modelValue
                    }
                    else{
                        ngModel.$setValidity('dt_diferenca_maior_que', false)
                        return null
                    }
                }
                return modelValue

            }

            function formata_data(modelValue){
                if (re_data_inv.test(modelValue) && !isNaN(Date.parse(modelValue)))
                    return inverte_data(modelValue, '-', '/')
                else
                    return ''
            }
        }
    }
})

app.directive('dh', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            ms: '@dh',
            campoTeste: '@',
            valorTeste: '@',
            diferencaMaiorQue: '@',
            futura: '@',
            grupo: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_dh)
            ngModel.$formatters.push(formata_dh)
            function remove_formatos(valor){
                return valor.replace(/[^\d]/g, '')
            }

            function formata_view(somenteNumeros){
                if (somenteNumeros){
                    switch(somenteNumeros.length){
                        case 1:
                        case 2: return somenteNumeros
                        case 3:
                        case 4: return somenteNumeros.replace(/(.{2})(.{1,2})/, '$1/$2')
                        case 5:
                        case 6:
                        case 7:
                        case 8: return somenteNumeros.replace(/(.{2})(.{2})(.{1,4})/, '$1/$2/$3')
                        case 9:
                        case 10: return somenteNumeros.replace(/(.{2})(.{2})(.{4})(.{1,2})/, '$1/$2/$3 $4')
                        case 11:
                        case 12: return somenteNumeros.replace(/(.{2})(.{2})(.{4})(.{2})(.{1,2})/, '$1/$2/$3 $4:$5')
                        default: return somenteNumeros.replace(/(.{2})(.{2})(.{4})(.{2})(.{2})(.{1,2})/, '$1/$2/$3 $4:$5:$6')
                    }
                }
                return somenteNumeros
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_view(modelValue))
                ngModel.$render()
            }

            function valida_dh(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('dh', true)
                        return null
                }
                var somenteNumeros = remove_formatos(viewValue)
                atualiza_view(somenteNumeros)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('dh', true)
                        return null
                    }
                }
                if (somenteNumeros.length != 14 && somenteNumeros.length != 12){
                    ngModel.$setValidity('dh', false)
                    return null
                }
                let str_replace
                if (somenteNumeros.length == 14)
                    str_replace = '$3-$2-$1 $4:$5:$6'
                else
                    str_replace = '$3-$2-$1 $4:$5'
                var modelValue = somenteNumeros.replace(/(.{2})(.{2})(.{4})(.{2})(.{2})(.{2})?/, str_replace)
                var data = Date.parse(modelValue)
                if (isNaN(data) || !re_dh_inv.test(modelValue)){
                    ngModel.$setValidity('dh', false)
                    return null
                }
                else
                    ngModel.$setValidity('dh', true)

                // Datahora é válida, testar outras coisas.
                // Testando diferença maior que:
                if (scope.diferencaMaiorQue){
                    var hoje = Date.now()
                    var [tempo, unidade] = scope.diferencaMaiorQue.split(" ")
                    if ((hoje - data) > parseInt(tempo)*unidades_data[unidade])
                        ngModel.$setValidity('dh_diferenca_maior_que', true)
                    else
                        ngModel.$setValidity('dh_diferenca_maior_que', false)
                    return modelValue
                }
                // Testando data futura
                if (scope.futura){
                    if (["TI", "Gestor de Operação"].indexOf(scope.grupo) >= 0)
                        ngModel.$setValidity('dh_futura', true)
                    else{
                        var hoje = Date.now()
                        var [tempo, unidade] = scope.futura.split(" ")
                        if (data > (hoje + parseInt(tempo)*unidades_data[unidade]))
                            ngModel.$setValidity('dh_futura', true)
                        else
                            ngModel.$setValidity('dh_futura', false)
                    }
                    return modelValue

                }
                ngModel.$setValidity('dh', true)
                return modelValue
            }

            function formata_dh(modelValue){
                if (re_dh_inv.test(modelValue) && !isNaN(Date.parse(modelValue)))
                    if (scope.ms)
                        return inverte_data_hora(modelValue, '-', '/')
                    else
                        return inverte_data_hora(modelValue, '-', '/').split(".")[0]
                else
                    return ''
            }
        }
    }
})

app.directive('dhfutura', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            ms: '@dh',
            campoTeste: '@',
            valorTeste: '@',
            diferencaMaiorQue: '@',
            futura: '@',
            grupo: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_dh)
            ngModel.$formatters.push(formata_dh)
            function remove_formatos(valor){
                return valor.replace(/[^\d]/g, '')  
            }

              function valida_dh(viewValue){
                if(typeof(viewValue) == 'object')
                    viewValue = moment(viewValue).format('DD/MM/YYYY HH:mm')

                  if (!viewValue){
                        ngModel.$setValidity('dh', true)
                        return null
                }
                var somenteNumeros = remove_formatos(viewValue)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('dh', true)
                        return null
                    }
                }
                if (somenteNumeros.length != 14 && somenteNumeros.length != 12){
                    ngModel.$setValidity('dh', false)
                    return null
                }
                let str_replace
                if (somenteNumeros.length == 14)
                    str_replace = '$3-$2-$1 $4:$5:$6'
                else
                    str_replace = '$3-$2-$1 $4:$5'
                var modelValue = somenteNumeros.replace(/(.{2})(.{2})(.{4})(.{2})(.{2})(.{2})?/, str_replace)
                var data = Date.parse(modelValue)
                if (isNaN(data) || !re_dh_inv.test(modelValue)){
                    ngModel.$setValidity('dh', false)
                    return null
                }
                else
                    ngModel.$setValidity('dh', true)

                  // Datahora é válida, testar outras coisas.
                // Testando diferença maior que:
                if (scope.diferencaMaiorQue){
                    var hoje = Date.now()
                    var [tempo, unidade] = scope.diferencaMaiorQue.split(" ")
                    if ((hoje - data) > parseInt(tempo)*unidades_data[unidade])
                        ngModel.$setValidity('dh_diferenca_maior_que', true)
                    else
                        ngModel.$setValidity('dh_diferenca_maior_que', false)
                    return modelValue
                }
                // Testando data futura
                if (scope.futura){
                    if (["TI", "Gestor de Operação"].indexOf(scope.grupo) >= 0)
                        ngModel.$setValidity('dh_futura', true)
                    else{
                        var hoje = Date.now()
                        var [tempo, unidade] = scope.futura.split(" ")
                        if (data > (hoje + parseInt(tempo)*unidades_data[unidade]))
                            ngModel.$setValidity('dh_futura', true)
                        else
                            ngModel.$setValidity('dh_futura', false)
                    }
                    return modelValue

                  }
                ngModel.$setValidity('dh', true)
                return modelValue
            }

              function formata_dh(modelValue){
                if (re_dh_inv.test(modelValue) && !isNaN(Date.parse(modelValue)))
                    if (scope.ms)
                        return inverte_data_hora(modelValue, '-', '/')
                    else
                        return inverte_data_hora(modelValue, '-', '/').split(".")[0]
                else
                    return ''
            }
        }
    }
})

app.directive('digitos', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            maiorQue: '@',
            menorQue: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_digitos)
            ngModel.$formatters.push(formata_digitos)

            function valida_digitos(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('digitos', true)
                        return null
                }

                var somenteNumeros = viewValue.replace(re_nao_digitos, '')
                atualiza_view(somenteNumeros)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('digitos', true)
                        return null
                    }
                }
                if (scope.maiorQue){
                    if (Number(somenteNumeros) > Number(maiorQue)){
                        ngModel.$setValidity('digitos_maior_que', true)
                        return somenteNumeros
                    }
                    else{
                        ngModel.$setValidity('digitos_maior_que', false)
                        return null
                    }
                }
                if (scope.menorQue){
                    if (Number(somenteNumeros) < Number(menorQue)){
                        ngModel.$setValidity('digitos_menor_que', true)
                        return somenteNumeros
                    }
                    else{
                        ngModel.$setValidity('digitos_menor_que', false)
                        return null
                    }
                }
                ngModel.$setValidity('digitos', true)
                return somenteNumeros
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_digitos(modelValue))
                ngModel.$render()
            }

            function formata_digitos(modelValue){
                if (modelValue){
                    return modelValue.toString()
                                     .split("")
                                     .reverse()
                                     .join("")
                                     .replace(/(\d{3})/g, '$1.')
                                     .replace(/\.$/, '')
                                     .split("")
                                     .reverse()
                                     .join("")
                }
                return modelValue
            }
        }
    }
})

app.directive('digitosFloat', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            maiorQue: '@',
            menorQue: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_digitos)
            ngModel.$formatters.push(formata_digitos)

            function valida_digitos(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('digitos', true)
                        return null
                }
                var somenteNumeros = viewValue
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('digitos', true)
                        return null
                    }
                }
                if (scope.maiorQue){
                    if (parseFloat(somenteNumeros) > parseFloat(scope.maiorQue)){
                        ngModel.$setValidity('digitos_maior_que', true)
                    }
                    else{
                        ngModel.$setValidity('digitos_maior_que', false)
                    }
                }

                if (scope.menorQue){
                    if (parseFloat(somenteNumeros) < parseFloat(scope.menorQue)){
                        ngModel.$setValidity('digitos_menor_que', true)
                    }
                    else{
                        ngModel.$setValidity('digitos_menor_que', false)
                    }
                }
                somenteNumeros = viewValue.replace(re_nao_digitos, '')
                atualiza_view(somenteNumeros)
                return somenteNumeros
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_digitos(modelValue))
                ngModel.$render()
            }

            function formata_digitos(modelValue){
                if (modelValue){
                    return modelValue.toString()
                                     .split("")
                                     .reverse()
                                     .join("")
                                     .replace(/(\d{2})/g, '$1.')
                                     .replace(/\.$/, '')
                                     .split("")
                                     .reverse()
                                     .join("")
                }
                return modelValue
            }
        }
    }
})

app.directive('digitosSemPonto', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            maiorQue: '@',
            menorQue: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_digitos)
            ngModel.$formatters.push(formata_digitos)

            function valida_digitos(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('digitos', true)
                        return null
                }

                var somenteNumeros = viewValue.replace(re_nao_digitos, '')
                atualiza_view(somenteNumeros)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('digitos', true)
                        return null
                    }
                }
                if (scope.maiorQue){
                    if (Number(somenteNumeros) > Number(maiorQue)){
                        ngModel.$setValidity('digitos_maior_que', true)
                        return somenteNumeros
                    }
                    else{
                        ngModel.$setValidity('digitos_maior_que', false)
                        return null
                    }
                }
                if (scope.menorQue){
                    if (Number(somenteNumeros) < Number(menorQue)){
                        ngModel.$setValidity('digitos_menor_que', true)
                        return somenteNumeros
                    }
                    else{
                        ngModel.$setValidity('digitos_menor_que', false)
                        return null
                    }
                }
                ngModel.$setValidity('digitos', true)
                return somenteNumeros
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_digitos(modelValue))
                ngModel.$render()
            }

            function formata_digitos(modelValue){
                if (modelValue)
                    return modelValue.split("")
                                     .reverse()
                                     .join("")
                                     .replace(/\.$/, '')
                                     .split("")
                                     .reverse()
                                     .join("")
                return modelValue
            }
        }
    }
})

app.directive('email', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_email)

            function valida_email(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('email', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('email', true)
                        return null
                    }
                }
                if (re_email.test(viewValue)){
                    ngModel.$setValidity('email', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('email', false)
                    return null
                }

            }
        }
    }
})


app.directive('fone', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '=',
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_fone)
            ngModel.$formatters.push(formata_fone)

            function remove_formatos(valor){
                return valor.replace(/[^\d]/g, '')
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_fone(modelValue))
                ngModel.$render()
            }

            function valida_fone(viewValue){

                if (!viewValue){
                        ngModel.$setValidity('fone', true)
                        return viewValue
                }
                var modelValue = remove_formatos(viewValue)
                atualiza_view(modelValue)

                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('fone', true)
                        return modelValue
                    }
                }
                if (modelValue.length < 10){
                    ngModel.$setValidity('fone', false)
                    return modelValue
                }
                ngModel.$setValidity('fone', true)
                return modelValue
            }

            function formata_fone(modelValue){
                if (modelValue){
                    if (modelValue.length < 11){
                        switch(modelValue.length){
                            case 1:
                            case 2: return modelValue.replace(/(.{1,2})/, '($1')
                            case 3:
                            case 4:
                            case 5:
                            case 6:return modelValue.replace(/(.{2})(.{1,4})/, '($1) $2')
                            default: return modelValue.replace(/(.{2})(.{4})(.{1,4})/, '($1) $2-$3')
                        }
                    }
                    else{
                        switch(modelValue.length){
                            case 1:
                            case 2: return modelValue.replace(/(.{1,2})/, '($1')
                            case 3: return modelValue.replace(/(.{2})(.{1})/, '($1) $2')
                            case 4:
                            case 5:
                            case 6:
                            case 7: return modelValue.replace(/(.{2})(.{1})(.{1,4})/, '($1) $2 $3')
                            default: return modelValue.replace(/(.{2})(.{1})(.{4})(.{1,4})/, '($1) $2 $3-$4')
                        }
                    }
                }
                return modelValue
            }
        }
    }
})

app.directive('hora', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            testaMenorIgual: '=',
            menorIgual: '@',
            horaDiferenteDe: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_hora)
            ngModel.$formatters.push(formata_hora)

            function atualiza_view(valor){
                valor = valor.replace(/[^\d]/g, '')
                switch(valor.length){
                            case 1:
                            case 2: break
                            default: valor = valor.replace(/(.{2})(.{1,2})/, '$1:$2')
                        }

                ngModel.$setViewValue(valor)
                ngModel.$render()
            }

            function valida_hora(viewValue){
                if (!viewValue){
                    ngModel.$setValidity('hora', true)
                    return null
                }
                if(viewValue && viewValue == scope.horaDiferenteDe){
                    ngModel.$setValidity('hora', false)
                    return null
                }
                atualiza_view(viewValue)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('hora', true)
                        return null
                    }
                }

                if (moment(viewValue, 'HH:mm').format("HH:mm") == viewValue){
                    ngModel.$setValidity('hora', true)
                    if (scope.testaMenorIgual){
                        if (moment(viewValue, 'HH:mm') <= moment(scope.menorIgual, 'HH:mm:ss'))
                            ngModel.$setValidity('menor_igual', true)
                        else{
                            ngModel.$setValidity('menor_igual', false)
                            return null
                        }
                    }
                    else
                        ngModel.$setValidity('menor_igual', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('hora', false)
                    return null
                }
            }

            function formata_hora(modelValue){
                if (modelValue)
                    return moment(modelValue, 'HH:mm:ss').format('HH:mm')
            }
        }
    }
})


app.directive('duracao', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            testaMenorIgual: '=',
            menorIgual: '@',
            horaDiferenteDe: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_duracao)
            ngModel.$formatters.push(formata_duracao)

            function atualiza_view(valor){
                valor = valor.replace(/[^\d]/g, '')
                switch(valor.length){
                            case 1:
                            case 2: break
                            default: valor = valor.replace(/(.{2})(.{1,2})/, '$1:$2')
                        }

                ngModel.$setViewValue(valor)
                ngModel.$render()
            }

            function valida_duracao(viewValue){
                if (!viewValue){
                    ngModel.$setValidity('duracao', true)
                    return null
                }
                if(viewValue && viewValue == scope.horaDiferenteDe){
                    ngModel.$setValidity('duracao', false)
                    return null
                }
                atualiza_view(viewValue)
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('duracao', true)
                        return null
                    }
                }
                let md = moment.duration(viewValue)
                if (md.format("HH:mm")== viewValue){
                    ngModel.$setValidity('duracao', true)
                    if (scope.testaMenorIgual){
                        if (md <= moment.duration(scope.menorIgual))
                            ngModel.$setValidity('menor_igual', true)
                        else{
                            ngModel.$setValidity('menor_igual', false)
                            return null
                        }
                    }
                    else
                        ngModel.$setValidity('menor_igual', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('duracao', false)
                    return null
                }
            }

            function formata_duracao(modelValue){
                if (modelValue){
                  return moment.duration(modelValue).format('HH:mm')
                }
            }
        }
    }
})

app.directive('nomeDiscourse', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(nome_discourse)

            function nome_discourse(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('nome_discourse', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('nome_discourse', true)
                        return null
                    }
                }
                if (re_nome_discourse.test(viewValue)){
                    ngModel.$setValidity('nome_discourse', true)
                    if (viewValue.slice(-1) == '_'){
                      ngModel.$setValidity('nome_discourse_termina_', false)
                      return null
                    }
                    ngModel.$setValidity('nome_discourse_termina_', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('nome_discourse', false)
                    return null
                }
            }
        }
    }
})

app.directive('naoNulo', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_numero_letra_traco_ponto)
            function valida_numero_letra_traco_ponto(viewValue){
                if (viewValue.id)
                    ngModel.$setValidity('nao_nulo', true)
                else
                    ngModel.$setValidity('nao_nulo', false)
                return viewValue
            }
        }
    }
})


app.directive('numeroLetraTracoPonto', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_numero_letra_traco_ponto)

            function valida_numero_letra_traco_ponto(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('numero_letra_traco_ponto', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('numero_letra_traco_ponto', true)
                        return null
                    }
                }
                if (re_numero_letra_traco_ponto.test(viewValue)){
                    ngModel.$setValidity('numero_letra_traco_ponto', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('numero_letra_traco_ponto', false)
                    return null
                }
            }
        }
    }
})


app.directive('real', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            maiorQue: '@',
            menorQue: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_real)
            ngModel.$formatters.push(formata_real)

            function valida_real(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('real', true)
                        return null
                }
                var somenteNumeros = viewValue.replace(re_nao_digitos, '')
                if (somenteNumeros.length < 3)
                    somenteNumeros = "00"+somenteNumeros
                var modelValue = Number(somenteNumeros.slice(0,-2)+"."+somenteNumeros.slice(-2))
                atualiza_view(modelValue)

                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('real', true)
                        return null
                    }
                }
                if (scope.maiorQue){
                    if (modelValue > Number(scope.maiorQue)){
                        ngModel.$setValidity('real_maior_que', true)
                        return modelValue
                    }
                    else{
                        ngModel.$setValidity('real_maior_que', false)
                        return null
                    }
                }
                if (scope.menorQue){
                    if (modelValue < Number(scope.menorQue)){
                        ngModel.$setValidity('real_menor_que', true)
                        return modelValue
                    }
                    else{
                        ngModel.$setValidity('real_menor_que', false)
                        return null
                    }
                }
                ngModel.$setValidity('real', true)
                return modelValue
            }

            function atualiza_view(modelValue){
                ngModel.$setViewValue(formata_real(modelValue))
                ngModel.$render()
            }

            function formata_real(modelValue){
                if (modelValue == null)
                    return modelValue
                modelValue = String(modelValue)
                if (modelValue){
                    var [antes, depois] = modelValue.split(".")
                    if (!depois)
                        depois = "00"
                    if (depois.length == 1)
                        depois += "0"
                    return antes.split("")
                                 .reverse()
                                 .join("")
                                 .replace(/(\d{3})/g, '$1.')
                                 .replace(/\.$/, '')
                                 .split("")
                                 .reverse()
                                 .join("") + ","+depois
                }
                return modelValue
            }
        }
    }
})


app.directive('strEspacoAcentoNumero', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_str_espaco_acento_numero)

            function valida_str_espaco_acento_numero(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('str_espaco_acento_numero', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('str_espaco_acento_numero', true)
                        return null
                    }
                }
                if (re_str_espaco_acento_numero.test(viewValue)){
                    ngModel.$setValidity('str_espaco_acento_numero', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('str_espaco_acento_numero', false)
                    return null
                }

            }
        }
    }
})

app.directive('strEspacoAcentoNumeroLinha', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_str_espaco_acento_numero_linha)

            function valida_str_espaco_acento_numero_linha(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('str_espaco_acento_numero_linha', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('str_espaco_acento_numero_linha', true)
                        return null
                    }
                }
                if (re_str_espaco_acento_numero_linha.test(viewValue)){
                    ngModel.$setValidity('str_espaco_acento_numero_linha', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('str_espaco_acento_numero_linha', false)
                    return null
                }

            }
        }
    }
})

app.directive('strNomeSobrenome', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_str_nome_sobrenome)

            function valida_str_nome_sobrenome(viewValue){
                if (!viewValue){
                    ngModel.$setValidity('str_nome_sobrenome', true)
                    return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('str_nome_sobrenome', true)
                        return null
                    }
                }
                let nomeSobrenome = viewValue.trim()
                let lengthNomeSobrenome = nomeSobrenome.split(' ')
                if (lengthNomeSobrenome.length >= 2){
                    ngModel.$setValidity('str_nome_sobrenome', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('str_nome_sobrenome', false)
                    return null
                }

            }
        }
    }
})

app.directive('url', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_url)

            function valida_url(viewValue){
                if (!viewValue){
                        ngModel.$setValidity('url', true)
                        return null
                }
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('url', true)
                        return null
                    }
                }
                const re_url = /^\/[#a-z0-9_]+(\/[#a-z0-9_]+)*$/
                if (re_url.test(viewValue)){
                    ngModel.$setValidity('url', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('url', false)
                    return null
                }

            }
        }
    }
})

app.directive('vazio', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            valorTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_vazio)

            function valida_vazio(viewValue){
                if (scope.campoTeste){
                    if (scope.obj[scope.campoTeste] != scope.valorTeste){
                        ngModel.$setValidity('vazio', true)
                        return null
                    }
                }
                if (viewValue){
                    ngModel.$setValidity('vazio', false)
                    return null
                }
                else{
                    ngModel.$setValidity('vazio', true)
                    return viewValue
                }

            }
        }
    }
})

app.directive('igualCampo', function() {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_igual_campo)

            function valida_igual_campo(viewValue){
                if (scope.obj[scope.campoTeste] != viewValue){
                    ngModel.$setValidity('igual_campo', false)
                    return null
                }
                else{
                    ngModel.$setValidity('igual_campo', true)
                    return viewValue
                }
            }
        }
    }
})


app.directive('validaToken', function () {
    return {
        restrict: 'A',
        require: "ngModel",
        scope: {
            campoTeste: '@',
            obj: '='
        },
        link: function(scope, element, attrs, ngModel){
            ngModel.$parsers.push(valida_token)

            function valida_token(viewValue){
                if(re_valida_token.test(viewValue)){
                    ngModel.$setValidity('token_invalido', true)
                    return viewValue
                }
                else{
                    ngModel.$setValidity('token_invalido', false)
                    return viewValue
                }
            }
        }
    }
})

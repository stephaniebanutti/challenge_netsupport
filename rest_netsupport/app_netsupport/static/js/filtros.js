app.filter("datahora", function(){
    return function (data, mostrar_ms){
        if(data){
            if (!isNaN(Date.parse(data))) {
                // Data é válida no formato yyyy-MM-dd

                var vet_dh = data.split("T")
                var vet_data = vet_dh[0].split('-')
                var vet_hora = vet_dh[1]

                if (mostrar_ms != 'mostrar_ms' || mostrar_ms == undefined) {
                    vet_hora = vet_dh[1].split('.')
                    vet_hora = vet_hora[0]
                }
                return vet_data[2]+'/'+vet_data[1]+'/'+vet_data[0]+" "+vet_hora
            }
            else
                return '';
        }
    }
})

app.filter("data", function(){
    return function (data){
        if(data){
            if (isNaN(Date.parse(data)))
                return data
            else
                return data.split("-").reverse().join("/")
        }
    }
})


app.filter('quebralinha', function() {
    return function(text) {
        return text.replace(/\n\r?/g, '<br/>')
    }
})

app.filter('fone', function() {
    return function(fone) {
        if (!fone || fone.length < 10)
            return fone
        if (fone.length == 10){
            return fone.replace(/(.{2})(.{4})(.{1,4})/, '($1) $2-$3')
        }
        else{
            return fone.replace(/(.{2})(.{1})(.{4})(.{1,4})/, '($1) $2 $3-$4')
        }
    }
})
app.filter('cpf', function() {
    return function(cpf) {
        if (!cpf || cpf.length != 11)
            return cpf
        return cpf.replace(/(.{3})(.{3})(.{3})(.{1,2})/, '$1.$2.$3-$4')
    }
})

app.filter('cnpj', function() {
    return function(cnpj) {
        if (!cnpj || cnpj.length != 14)
            return cnpj
        return cnpj.replace(/(.{2})(.{3})(.{3})(.{4})(.{1,2})/, '$1.$2.$3/$4-$5')
    }
})

app.filter('realBr', function() {
    return function (realBr){
        if (realBr || realBr == 0)
            return realBr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        return realBr
	}
})

app.filter('agencia_conta', function() {
    return function(agencia_conta) {
        if (agencia_conta.length <= 1)
            return agencia_conta
        digito = agencia_conta.slice(-1)
        conta = agencia_conta.slice(0, -1)
        if (digito){
            return conta.split("")
                        .reverse()
                        .join("")
                        .replace(/(\d{3})/g, '$1.')
                        .replace(/\.$/, '')
                        .split("")
                        .reverse()
                        .join("") + "-" + digito
        }
        return agencia_conta
    }
})

app.filter('digitos', function() {
    return digitos => {
        if (digitos || digitos >= 3)
            return digitos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return digitos
	}
})

app.filter('capitalize', function() {
    return function(input) {
      return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
    }
});

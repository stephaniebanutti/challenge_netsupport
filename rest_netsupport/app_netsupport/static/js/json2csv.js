app.factory('json2csv', function () {
    return {
        converter_array_csv: function(args) {
            var result, ctr, keys, delimita_coluna, delimita_linha, data;

            data = angular.fromJson(args.data) || null
            if (data == null ) {
                return null
            }

            delimita_coluna = args.delimita_coluna || ';'
            delimita_linha = args.delimita_linha || '\n'

            keys = Object.keys(data[0])
            if(args.campos){
                keys.forEach(function (key) {
                    if(args.campos.indexOf(key) == -1)
                        keys.splice(keys.indexOf(key), 1)
                })
            }
            else if(keys.indexOf('$$hashKey') != -1)
                keys.splice(keys.indexOf('$$hashKey'), 1)

            result = ''
            result += keys.join(delimita_coluna)
            result += delimita_linha

            data.forEach(function(item) {
                ctr = 0
                keys.forEach(function(key) {
                    if (ctr > 0) result += delimita_coluna
                    if (item[key] == null) item[key] = ''
                    if (key.indexOf('total') == 0 || key.indexOf('valor') == 0)
                        item[key] = item[key].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    result += item[key]
                    ctr++

                })
                result += delimita_linha
            })

            return result;
        },
        nome_arquivo_csv: function(args) {
            var data = args.filtro
            var nome = args.prefixo
                if(!data.data_criado)
                    nome += '-'+ moment(new Date()).format("YYYY-MM-DD_HH-mm-ss")

            angular.forEach(data, function(value, key){
                if(value) {
                    if(key.indexOf('data_') != -1)
                        value = moment(value).format("YYYY-MM-DD")
                    nome += '-' + value
                }
                else
                    nome += '-'+key
            })
            return nome += '.csv'
        },
        download_csv: function(nome_arquivo, args, campos) {

            var data, campos, nome_arquivo, link;

            var csv = this.converter_array_csv({
                data: args,
                campos: campos
            })
            if (csv == null) return;

            nome_arquivo =  this.nome_arquivo_csv(nome_arquivo) || 'arquivo.csv'

            if (!csv.match(/^data:text\/csv/i)) {
                csv = 'data:text/csv;charset=utf-8,' + csv
            }
            data = encodeURI(csv)
            link = document.createElement('a')
            link.setAttribute('href', data)
            link.setAttribute('download', nome_arquivo)
            document.body.appendChild(link);
            link.click()
        }
    }
})

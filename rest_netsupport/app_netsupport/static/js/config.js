app.value("config", {
    app_name: 'Portal NetSupport',
    base_url: '/portal',
    app_mode: 'dev',
    tempo_atualizacao_rotinas: 900,
    redirect_url_desativacao: 'https://docs.google.com/forms/d/1UPk2Ji9dK6mNn-Z1ISA_6V0GpZv6EbTmHux4po3FPRw/viewform?edit_requested=true',
    desativa_conta_form: '',
    loja: {
        prod: {
            url: 'https://loja.netsupport.com.br'
        },
        teste: {
            url: 'https://loja-teste.netsupport.com.br'
        },
        dev:{
            url: 'https://loja-teste.netsupport.com.br'
        }
    },
    trackers: {
        prod: {
            google_analytics: 'UA-60038561-1',
            facebook_pixel: '812655602195141',
            linkedin: "1162610"
        },
        teste: {
            google_analytics: 'UA-60038561-6',
            facebook_pixel: '413155726079539',
            linkedin: ""
        },
        dev:{
            google_analytics: 'UA-60038561-7',
            facebook_pixel: '2073376666296816',
            linkedin: ""
        }
    },
    moodle_help: {
        prod: {
            base_url: 'https://nsacademy.netsupport.com.br',
            page_url: '/mod/page/view.php?id=',
            course_url: '/course/view.php?id=',
            doutor_ids: {
                dashboard: '21',
                pendencias: '6',
                candidato_job: '15',
                competencias: '10',
                dados_doutor: '3',
                documentos: '9',
                job: '14',
                slack: '5',
                cidade: '',
                regras: '4'
            }
        },
        dev: {
            base_url: 'https://moodle-dev.netsupport.com.br',
            page_url: '/mod/page/view.php?id=',
            course_url: '/course/view.php?id=',
            doutor_ids: {
                dashboard: '',
                pendencias: '',
                candidato_job: '',
                competencias: '',
                dados_doutor: '',
                documentos: '',
                job: '',
                slack: '',
                cidade: '',
                regras: ''
            }
        },
        teste: {
            base_url: 'https://moodle-teste.netsupport.com.br',
            page_url: '/mod/page/view.php?id=',
            course_url: '/course/view.php?id=',
            doutor_ids: {
                dashboard: '8',
                pendencias: '6',
                candidato_job: '15',
                competencias: '10',
                dados_doutor: '3',
                documentos: '9',
                job: '14',
                slack: '5',
                cidade: '',
                regras: ''
            }
        }
    },
    opcoes: {
        status_jobs: [
            {valor: "Aberto",                   desc: "Aberto"},
            {valor: "Atendimento encerrado",    desc: "Atendimento encerrado"},
            {valor: "Cancelado",                desc: "Cancelado"},
            {valor: "Categorizado",             desc: "Categorizado"},
            {valor: "Com Doutor",               desc: "Com Supporter"},
            {valor: "Com Gestor",               desc: "Com Gestor"},
            {valor: "Divulgado",                desc: "Divulgado"},
            {valor: "Doutor em tr??nsito",       desc: "Supporter em tr??nsito"},
            {valor: "Doutor no local",          desc: "Supporter no local"},
            {valor: "Doutor orientado",         desc: "Supporter orientado"},
            {valor: "Falha valida????o",          desc: "Falha valida????o "},
            {valor: "Fechado",                  desc: "Fechado"},
            {valor: "Finalizado",               desc: "Finalizado"},
            {valor: "Reagendado",               desc: "Reagendado"},
            {valor: "Rescindido",               desc: "Rescindido"},
            {valor: "Sem Doutor",               desc: "Sem Supporter"},
            {valor: "Validado com sucesso",     desc: "Validado com sucesso"},
            {valor: "Fechamento cancelado",     desc: "Fechamento cancelado"}
        ],
        sla: [
            {valor: "dentro",   desc: "Dentro"},
            {valor: "vencido", desc: "Vencido"}
        ],
        sexo: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "F", desc: "Feminino"},
            {valor: "M", desc: "Masculino"}
        ],
        pcd: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "S", desc: "Sim"},
            {valor: "N", desc: "N??o"}
        ],
        tipo_conta: [
             {valor: undefined, desc: "SELECIONE"},
             {valor: "corrente", desc: "Conta Corrente"},
             {valor: "poupanca", desc: "Conta poupan??a"}
        ],
        operacao_conta: [
            {valor: null, desc: "SELECIONE"},
            {valor: '001', desc: '001 - Conta Corrente de Pessoa F??sica'},
            {valor: '003', desc: '003 ??? Conta Corrente de Pessoa Jur??dica'},
            {valor: '013', desc: '013 ??? Poupan??a de Pessoa F??sica'},
            {valor: '022', desc: '022 ??? Poupan??a de Pessoa Jur??dica'}
        ],
        status: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "ativo", desc: "Ativo"},
            {valor: "inativo", desc: "Inativo"}
        ],
        // CLIENTE
        tipo_cliente: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "pequeno", desc: "Pequeno"},
            {valor: "grande", desc: "Grande"}
        ],
        tipo_faturamento: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "fixo", desc: "Fixo"},
            {valor: "variavel", desc: "Vari??vel"}
        ],
        frequencia: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "pontual", desc: "Pontual"},
            {valor: "recorrente", desc: "Recorrente"}
        ],
        tipo_atendimento: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "presencial", desc: "Presencial"},
            {valor: "remoto", desc: "Remoto"}
        ],
        tipo_data_job: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "abertura", desc: "Abertura"},
            {valor: "atendimento", desc: "Atendimento"},
            {valor: "fechamento", desc: "Fechamento"}
        ],
        tipo_deslocamento: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "variavel", desc: "Vari??vel"},
            {valor: "fixo", desc: "Fixo"},
            {valor: "zero", desc: "Zero"}
        ],
        cod_chamado_cli_obrigatorio: [
            {valor: undefined, desc: 'SELECIONE'},
            {valor: true, desc: 'Sim'},
            {valor: false, desc: 'N??o'}
        ],
        tipo_documento: [
            {valor: undefined, nome: 'SELECIONE', desc: 'Selecione um item.', duracao: null},
            {valor: '1_id_doutor', nome: 'Documento de identifica????o do supporter', desc: 'Escolha um subtipo para documento de identifica????o. Poder??o ser utilizados CNH ou RG/CPF.'},
            {valor: '2_ac_doutor_pc', nome: 'Certid??o negativa de antecedentes criminais do supporter: pol??cia civil', desc: 'Emita este certificado de antecedentes criminais visitando o site da pol??cia civil de seu estado e solicite emiss??o deste documento. No google pesquise certid??o antecedentes criminais XX onde XX ?? o seu estado. Ex: certid??o antecedentes criminais MG.'},
            {valor: '3_ac_doutor_pf', nome: 'Certid??o negativa de antecedentes criminais do supporter: pol??cia federal', desc: 'Emita este certificado de antecedentes criminais visitando o site da pol??cia federal e solicite emiss??o deste documento atrav??s do site https://servicos.dpf.gov.br/antecedentes-criminais/certidao.'},
            {valor: '4_self_doutor_doc', nome: 'Selfie do supporter com documento pessoal', desc: 'Envie uma foto com documento de identifica????o ao lado de seu rosto.'},
            {valor: '5_foto_doutor', nome: 'Foto do supporter', desc: 'Envie uma foto de rosto para identifica????o do seu perfil.'},
            {valor: '7_comprovante_residencia', nome: 'Comprovante de resid??ncia', desc: 'Envie c??pia de alguma conta que contenha o endere??o de sua resid??ncia (??gua, luz, telefone, etc).'},
            {valor: '11_comprovante_pj', nome: 'Comprovante da Pessoa Jur??dica', desc: 'Envie c??pia da certid??o emitida no site da Receita Federal: https://www.receita.fazenda.gov.br/PessoaJuridica/CNPJ/cnpjreva/Cnpjreva_Solicitacao2.asp. ?? importante que no arquivo conste da data e hora de emiss??o da certid??o.'},
            {valor: '12_curriculo', nome: 'Curr??culo', desc: 'Enviar Curr??culo'}
        ],
        estado: [
            {nome: 'SELECIONE', sigla: undefined},
            {nome: 'Acre', sigla: 'AC'},
            {nome: 'Alagoas', sigla: 'AL'},
            {nome: 'Amazonas', sigla: 'AM'},
            {nome: 'Amap??', sigla: 'AP'},
            {nome: 'Bahia', sigla: 'BA'},
            {nome: 'Cear??', sigla: 'CE'},
            {nome: 'Distrito Federal', sigla: 'DF'},
            {nome: 'Esp??rito Santo', sigla: 'ES'},
            {nome: 'Goi??s', sigla: 'GO'},
            {nome: 'Maranh??o', sigla: 'MA'},
            {nome: 'Minas Gerais', sigla: 'MG'},
            {nome: 'Mato Grosso do Sul', sigla: 'MS'},
            {nome: 'Mato Grosso', sigla: 'MT'},
            {nome: 'Par??', sigla: 'PA'},
            {nome: 'Para??ba', sigla: 'PB'},
            {nome: 'Pernambuco', sigla: 'PE'},
            {nome: 'Piau??', sigla: 'PI'},
            {nome: 'Paran??', sigla: 'PR'},
            {nome: 'Rio de Janeiro', sigla: 'RJ'},
            {nome: 'Rio Grande do Norte', sigla: 'RN'},
            {nome: 'Rond??nia', sigla: 'RO'},
            {nome: 'Roraima', sigla: 'RR'},
            {nome: 'Rio Grande do Sul', sigla: 'RS'},
            {nome: 'Santa Catarina', sigla: 'SC'},
            {nome: 'Sergipe', sigla: 'SE'},
            {nome: 'S??o Paulo', sigla: 'SP'},
            {nome: 'Tocantins', sigla: 'TO'}
        ],
        // FERRAMENTAS
        template : [
            {valor:undefined, desc: 'SELECIONE'},
            {valor:'email_candidato_doutor.html', desc: 'Candidato Supporter'},
            {valor:'email_notificacao_job_doutores.html', desc: 'Notifica????o job Supporter'},
            {valor:'email_notificacao_job_doutores_migrados.html', desc: 'Notifica????o job Supporters Migrados'},
            {valor:'email_reseta_senha.html', desc: 'Reseta Senha'},
            {valor:'email_divulgacao_job.html', desc: 'Divulgacao????o Job'}
        ],
        // FUNCIONALIDADE
        metodo: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "PUT", desc: "PUT"},
            {valor: "GET", desc: "GET"},
            {valor: "POST", desc: "POST"},
            {valor: "DELETE", desc: "DELETE"}
        ],
        menu : [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "S", desc: "Sim"},
            {valor: "N", desc: "N??o"}
        ],
        // GRUPO
        perfil: [
             {valor: undefined, desc: "SELECIONE"},
             {valor: "funcionario", desc: "Funcion??rio"},
             {valor: "doutor", desc: "Supporter"},
             {valor: "cliente", desc: "Cliente"}
        ],
        // INTEGRACAO
        tipo_integracao: [
            {valor: undefined, desc: 'SELECIONE'},
            {valor: 'oauth2', desc: 'Oauth 2'}
        ],
        // JOBS
        urgencia_atendimento: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: 'imediato', desc: 'Atendimento Imediato'},
            {valor: 'agendado', desc: 'Atendimento Agendado'}
        ],
        forma_atendimento: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: 'presencial', desc: 'presencial'},
            {valor: 'remoto', desc: 'remoto'}
        ],
        motivo_desassociacao: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: 'desistencia', desc: 'Desist??ncia'},
            {valor: 'abandono', desc: 'Abandono'}
        ],
        aceite_cliente: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: true, desc: 'Sim'},
            {valor: false, desc: 'N??o'}
        ],
        tipo_lancamento: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: 'reembolso_ns', desc: "Pagamento adicional por conta da NetSupport"},
            {valor: 'reembolso_cliente', desc: "Pagamento adicional por conta do Cliente"},
            {valor: 'cobranca_cliente', desc: "Cobran??a cliente"}
        ],
        tipo: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "atendimento", desc: "Atendimento Avulso"},
            {valor: "alocacao", desc: "Aloca????o"},
        ],
        sim_nao: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: true, desc: "sim"},
            {valor: false, desc: "n??o"}
        ],
        // PESSOA
        tipo_pessoa: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "fisica", desc: "F??sica"},
            {valor: "juridica", desc: "Jur??dica"}
        ],
        id_grupo: [
            {valor: undefined, desc: "SELECIONE"},
            {valor: "1", desc: "Supporter"},
            {valor: "2", desc: "Cliente"},
            {valor: "3", desc: "Gestor Demanda"},
            {valor: "4", desc: "MKT"},
            {valor: "5", desc: "TI"}
        ],
        // RELATORIO
        status_pagamento: [
            { valor: undefined, desc: "SELECIONE"},
            { valor: "pago", desc: "Pago"},
            { valor: "pendente", desc: "Pendente"},
        ],
        status_nota_fiscal: [
            { valor: undefined, desc: "SELECIONE"},
            { valor: "validado", desc: "Validado"},
            { valor: "pendente", desc: "Pendente"},
        ],
        status_pendencia: [
            { valor: undefined, desc: "SELECIONE"},
            { valor: "paga", desc: "Paga"},
            { valor: "pendente", desc: "Pendente"},
        ],
        status_recebimento: [
            { valor: undefined, desc: "SELECIONE"},
            { valor: "recebido", desc: "Recebido"},
            { valor: "pendente", desc: "Pendente"},
        ],
        status_faturamento: [
            { valor: undefined, desc: "SELECIONE"},
            { valor: "nao_faturado", desc: "N??o Faturado"},
            { valor: "faturado", desc: "Faturado" },
            { valor: "perda", desc: "Perda" },
        ],
        status_candidatura_job: [
            {id: undefined, nome: 'SELECIONE'},
            {id: 'na_fila', nome: 'Na fila'},
            {id: 'selecionado', nome: 'Selecionado para Atendimento'},
            {id: 'descartado', nome: 'Recusado para Job'},
            {id: 'desistiu', nome: 'Desistiu do Job'},
            {id: 'job_terminado', nome: 'Job Fechado'}
        ],
        tipo_custo: [
            { valor: "ciclo", desc: "Pagamento"},
            { valor: "periodo", desc: "Atendimento"},
        ],
        titular_conta: [
            { valor: undefined, desc: 'SELECIONE'},
            { valor: "pf", desc: "Pessoa F??sica"},
            { valor: "pj", desc: "Pessoa Jur??dica"},
        ],
        visibilidade_operacao: [
            {valor: undefined, desc: 'SELECIONE'},
            { valor: 'tudo', desc: "Todos os jobs"},
            { valor: 'operacao', desc: "Somente os jobs da opera????o atual"},
            { valor: 'meus', desc: "Somente seus pr??prios jobs"},
        ],
    }
})

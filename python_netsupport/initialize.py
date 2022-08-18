from filter import Filter


def main():
    info = "Deseja incluir filtros para sua pesquisa?\n(1) Sim (2) Não\n"
    qtd_tecnicos_atendimentos = "Quantidade de técnicos que realizaram N atendimentos nos últimos X dias: Resposta: "
    qtd_tecnicos_acesso_sistema = "Quantidade de técnicos que acessaram o sistema nos últimos Y dias: Resposta: "
    nota_tecnicos = "Quantidade de técnicos com nota média em todos atendimentos > X: Resposta: "
    obs = "Informe os desejáveis, caso não queira o filtro informado, digite '0'.\n"
    pesquisando = "Por favor, aguarde o retorno de sua pesquisa..."
    return_user = int(input(info))

    filter_object = Filter()

    if return_user == 1:
        print(obs)
        filter_object.resposta_tecnicos_atendimentos = (input(qtd_tecnicos_atendimentos))
        filter_object.resposta_tecnicos_acesso_sistemas = int(input(qtd_tecnicos_acesso_sistema))
        filter_object.resposta_nota_tecnicos = int(input(nota_tecnicos))
        print(pesquisando)
    else:
        print(pesquisando)

    data = filter_object.get()
    print(data)

    return data
        

if __name__ == "__main__":
    main()
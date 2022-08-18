from app_netsupport.models import AtendimentoDB, CidadeBrasilDB, TecnicoDB, UsuarioDB
from functions.response_views.decorator import calculate_datetime, eval_field, json_with_success, json_without_success


def SearchTechniciansByCityFunction(request):
    # REQUEST POSTS
    qtd_tecnicos_atendimentos = request.POST.get('qtd_tecnicos_atendimentos')
    qtd_tecnicos_acesso_sistema = request.POST.get('qtd_tecnicos_acesso_sistema')
    nota_tecnicos = request.POST.get('nota_tecnicos')

    # list response
    list_response = []

    if eval_field(qtd_tecnicos_acesso_sistema):
        difference_date = calculate_datetime(qtd_tecnicos_acesso_sistema)
        users_db = UsuarioDB.objects.filter(dh_ultimo_acesso__gte=difference_date)
    else:
        users_db = []

    all_citys = CidadeBrasilDB.objects.all()

    for object_city in all_citys:
        db_tecnicos = TecnicoDB.objects.filter(id_cidade=object_city.id)
        db_atendimentos = AtendimentoDB.objects.filter(id_tecnico__in=[key.id for key in db_tecnicos])

        # Quantidade de técnicos que realizaram N atendimentos nos últimos X dias
        if eval_field(qtd_tecnicos_atendimentos):
            difference_date = calculate_datetime(qtd_tecnicos_atendimentos)
            qtd_tecnicos_db_atendimentos = db_atendimentos.filter(dh_termino__gte=difference_date)
            tecnicos_atendimentos_ultimos_dias = len(qtd_tecnicos_db_atendimentos)
        else:
            tecnicos_atendimentos_ultimos_dias = len(db_atendimentos)

        # Quantidade de técnicos que acessaram o sistema nos últimos Y dias
        if eval_field(qtd_tecnicos_acesso_sistema):
            filter_tecnicos_acesso_sistema_ultimos_dias = db_tecnicos.filter(criado_por__in=[key.id for key in users_db])
            tecnicos_acesso_sistema_ultimos_dias = len(filter_tecnicos_acesso_sistema_ultimos_dias)
        else:
            tecnicos_acesso_sistema_ultimos_dias = len(db_tecnicos)

        # Quantidade de técnicos com nota média em todos atendimentos > X
        if eval_field(qtd_tecnicos_acesso_sistema):
            filter_tecnicos_nota_maior_que = db_atendimentos.filter(nota__gte=nota_tecnicos).values('id_tecnico').distinct()
            tecnicos_nota_maior_que = len(filter_tecnicos_nota_maior_que)
        else:
            tecnicos_nota_maior_que = len(db_tecnicos)

        list_response.append({
            "cidade": object_city.cidade,
            "estado": object_city.estado,
            "distancia": 0,
            "tecnicos_atendimentos_ultimos_dias": tecnicos_atendimentos_ultimos_dias,
            "tecnicos_acesso_sistema_ultimos_dias": tecnicos_acesso_sistema_ultimos_dias,
            "tecnicos_nota_maior_que": tecnicos_nota_maior_que
        })


    return json_with_success(list_response)
from connection import Connection
from dateutil.relativedelta import relativedelta
from datetime import datetime
import json


class Filter:
    def __init__(self) -> None:
        self.qtd_tecnicos_atendimentos = 0
        self.qtd_tecnicos_acesso_sistema = 0
        self.nota_tecnicos = 0
        self.cursor = None

    def _connect_ex(self):
        if not self.cursor:
            self.cursor = Connection().cursor()
    
    def get_citys(self):
        query = "SELECT id, estado, cidade, codigo_cidade FROM cidade_brasil ORDER BY cidade ASC"
        self.cursor.execute(query, ())
        dados = self.cursor.fetchall()
        if not dados:
            return []
        
        return [{
            "id": id,
            "estado": estado,
            "cidade": cidade,
            "codigo_cidade": codigo_cidade
        } for id, estado, cidade, codigo_cidade in dados]

    def get_qtd_atendimentos(self, city=None, dias=None):
        if dias > 0:
            difference_date = datetime.now() - relativedelta(days=int(dias))
            query, params = "SELECT COUNT(*) FROM tecnico t INNER JOIN cidade_brasil c ON t.id_cidade = c.codigo_cidade INNER JOIN atendimento a ON a.id_tecnico = t.id WHERE a.dh_termino >= %s AND t.id_cidade = %s GROUP BY a.id_tecnico", (difference_date,city,)
        else:
            query, params = "SELECT COUNT(*) as total FROM tecnico t INNER JOIN cidade_brasil c ON t.id_cidade = c.codigo_cidade WHERE t.id_cidade = %s", (city,)

        self.cursor.execute(query, params)
        dados = self.cursor.fetchall()
        if dados:
            for total in dados:
                return total[0]
        
        return 0

    def get_qtd_acesso_sistema(self, city=None, dias=None):
        if dias > 0:
            difference_date = datetime.now() - relativedelta(days=int(dias))
            query, params = "SELECT COUNT(*) FROM tecnico t INNER JOIN cidade_brasil c ON t.id_cidade = c.codigo_cidade INNER JOIN usuario u ON u.id = t.criado_por WHERE u.dh_ultimo_acesso >= %s AND t.id_cidade = %s", (difference_date, city,)
        else:
            query, params = "SELECT COUNT(*) FROM tecnico t INNER JOIN cidade_brasil c ON t.id_cidade = c.codigo_cidade INNER JOIN usuario u ON u.id = t.criado_por WHERE t.id_cidade = %s", (city,)
        
        self.cursor.execute(query, params)
        dados = self.cursor.fetchall()
        if dados:
            for total in dados:
                return total[0]
        
        return 0

    def get_qtd_nota_maior(self, city=None, nota=None):
        if nota > 0:
            query, params = "SELECT COUNT(*) FROM tecnico t INNER JOIN cidade_brasil c ON t.id_cidade = c.codigo_cidade INNER JOIN atendimento a ON a.id_tecnico = t.id WHERE a.nota >= %s AND t.id_cidade = %s GROUP BY a.id_tecnico", (nota,city,)
        else:
            query, params = "SELECT COUNT(*) as total FROM tecnico t INNER JOIN cidade_brasil c ON t.id_cidade = c.codigo_cidade WHERE t.id_cidade = %s", (city,)

        self.cursor.execute(query, params)
        dados = self.cursor.fetchall()
        if dados:
            for total in dados:
                return total[0]
        
        return 0

    def get(self):
        self._connect_ex()

        citys = self.get_citys()
        
        list_response = []
        for object_city in citys:
            codigo_cidade = object_city.get('codigo_cidade')
            tecnicos_atendimentos_ultimos_dias = self.get_qtd_atendimentos(city=codigo_cidade, dias=self.qtd_tecnicos_atendimentos)
            tecnicos_acesso_sistema_ultimos_dias = self.get_qtd_acesso_sistema(city=codigo_cidade, dias=self.qtd_tecnicos_acesso_sistema)
            tecnicos_nota_maior_que = self.get_qtd_nota_maior(city=codigo_cidade, nota=self.nota_tecnicos)

            list_response.append({
                "cidade": object_city.get('cidade'),
                "estado": object_city.get('estado'),
                "distancia": "0",
                "tecnicos_atendimentos_ultimos_dias": tecnicos_atendimentos_ultimos_dias,
                "tecnicos_acesso_sistema_ultimos_dias": tecnicos_acesso_sistema_ultimos_dias,
                "tecnicos_nota_maior_que": tecnicos_nota_maior_que
            })
    
        return json.dumps(list_response)
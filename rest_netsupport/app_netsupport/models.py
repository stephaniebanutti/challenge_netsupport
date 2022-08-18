from django.db import models
from enum import Enum


class BancoDeDados(str, Enum):
    NETSUPPORTDB = 'netsupportdb'


class DbManager(models.Manager):
    def get_queryset(self):
        qs = super().get_queryset()

        # if `use_db` is set on model use that for choosing the DB
        if hasattr(self.model, 'use_db'):
            qs = qs.using(self.model.use_db)
        return qs


class DBNetSupport(models.Model):
    use_db = BancoDeDados.NETSUPPORTDB.value
    objects = DbManager()

    class Meta:
        abstract = True


class CidadeBrasilDB(DBNetSupport):
    id = models.AutoField("ID", primary_key=True, auto_created=True)
    estado = models.CharField(max_length=2)
    nome_estado = models.CharField(max_length=50)
    cidade = models.CharField(max_length=100)
    codigo_cidade = models.IntegerField()
    codigo_estado = models.IntegerField()
    populacao = models.BigIntegerField()
    regiao = models.CharField(max_length=50)
    coordenada = models.CharField(max_length=50)
    parceiros = models.CharField(max_length=50)
    criado_por = models.BigIntegerField()
    criado_em = models.DateTimeField(auto_now_add=True)
    alterado_por = models.BigIntegerField()
    alterado_em = models.DateTimeField(auto_now_add=False, default=None)
    etag = models.IntegerField()

    class Meta:
        db_table = "cidade_brasil"
        indexes = [models.Index(
            fields=['id', 'codigo_cidade']
        )]
        managed = False


class AtendimentoDB(DBNetSupport):
    id = models.AutoField("ID", primary_key=True, auto_created=True)
    id_tecnico = models.BigIntegerField()
    dh_inicio = models.DateTimeField(auto_now_add=False, default=None)
    dh_termino = models.DateTimeField(auto_now_add=False, default=None)
    nota = models.DecimalField(max_digits=10, decimal_places=2)
    criado_por = models.BigIntegerField()
    criado_em = models.DateTimeField(auto_now_add=True)
    alterado_por = models.BigIntegerField()
    alterado_em = models.DateTimeField(auto_now_add=False, default=None)
    etag = models.IntegerField()

    class Meta:
        db_table = "atendimento"
        indexes = [models.Index(
            fields=['id', 'id_tecnico']
        )]
        managed = False


class TecnicoDB(DBNetSupport):
    id = models.AutoField("ID", primary_key=True, auto_created=True)
    nome = models.CharField(max_length=100)
    id_cidade = models.BigIntegerField()
    criado_por = models.BigIntegerField()
    criado_em = models.DateTimeField(auto_now_add=True)
    alterado_por = models.BigIntegerField()
    alterado_em = models.DateTimeField(auto_now_add=False, default=None)
    etag = models.IntegerField()

    class Meta:
        db_table = "tecnico"
        indexes = [models.Index(
            fields=['id', 'id_cidade']
        )]
        managed = False


class UsuarioDB(DBNetSupport):
    id = models.AutoField("ID", primary_key=True, auto_created=True)
    nome = models.CharField(max_length=100)
    dh_ultimo_acesso = models.DateTimeField(auto_now_add=False, default=None)
    criado_por = models.BigIntegerField()
    criado_em = models.DateTimeField(auto_now_add=True)
    alterado_por = models.BigIntegerField()
    alterado_em = models.DateTimeField(auto_now_add=False, default=None)
    etag = models.IntegerField()

    class Meta:
        db_table = "usuario"
        indexes = [models.Index(
            fields=['id', 'nome']
        )]
        managed = False
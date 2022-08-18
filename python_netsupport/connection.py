import psycopg2 as db


# CONFIGURAÇÕES DO BANCO
config = {
    "host": 'localhost',
    "database": 'netsupport',
    "user": 'postgres',
    "password": '120450'
}


class Connection:
    def __init__(self):
        try:
            self.conn = db.connect(host=config.get('host'), database=config.get('database'), user=config.get('user'), password=config.get('password'))
        except Exception as e:
            print("Erro na conexão", e)
            exit(1)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.commit()
        self.connection.close()

    @property
    def connection(self):
        return self.conn

    @property
    def cursor(self):
        return self.conn.cursor

    def commit(self):
        self.connection.commit()

    def fetchall(self):
        return self.cursor.fetchall()

    def execute(self, query, params=None):
        self.cursor.execute(query, params or ())

    def query(self, query, params=None):
        self.cursor.execute(query, params or ())
        return self.fetchall()
from dateutil.relativedelta import relativedelta
from datetime import datetime
import json


def json_with_success(data):
    return {
        "response": True,
        "data": data
    }


def json_without_success(data):
    return {
        "response": False,
        "data": data
    }


def eval_field(value):
    if value in ["", None]:
        return False
    
    return True


def eval_response(response):
    if response.get('response'):
        return True
    
    return False


def calculate_datetime(days):
    return datetime.now() - relativedelta(days=int(days))


def deal_file_with_data(data):
    with open('docs/retorno_pesquisa.json', 'wb') as outfile:
        outfile.write(json.dumps(data).encode())
        outfile.close()

    return open('docs/retorno_pesquisa.json', 'rb')
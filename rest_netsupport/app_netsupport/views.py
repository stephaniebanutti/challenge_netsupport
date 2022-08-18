from datetime import datetime
from io import BytesIO
from django.shortcuts import render
from django.core.exceptions import PermissionDenied
from django.http import FileResponse, JsonResponse
from django.views import View
from functions.response_views.decorator import deal_file_with_data, eval_response
from functions.technicians.decorator import SearchTechniciansByCityFunction


# Create your views here.
def csrf_failure(request, reason=""):
    raise PermissionDenied()


def HomeView(request):
    return render(request, 'home.html')


class TechniciansByCity(View):
    @staticmethod
    def post(request):
        search = SearchTechniciansByCityFunction(request)
        if not eval_response(search):
            return JsonResponse(
                search,
                safe=False,
                status=200
            )
        
        doc_url = "http://" + request.get_host() + "/docs/retorno_pesquisa.json"

        return JsonResponse(
            {
                "response": True,
                "data": doc_url
            },
            safe=False,
            status=200
        )
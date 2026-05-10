from django.http import JsonResponse
from django.urls import resolve, Resolver404
from django.conf import settings

class CustomLoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Vérifie si la réponse est une redirection vers la page de connexion
        # et si la requête semble être une requête API (par exemple, commence par /api/)
        if response.status_code == 302 and response.url and "/login" in response.url:
            # Tentative de déterminer si c'est une requête API en se basant sur le chemin
            # Si le chemin commence par /api/, on peut supposer que c'est une API
            if request.path_info.startswith('/api/'):
                return JsonResponse(
                    {"detail": "Authentification requise. Accès API bloqué par redirection."},
                    status=401
                )
        return response

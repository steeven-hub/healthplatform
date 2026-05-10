from django.http import JsonResponse

class CustomLoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Si Django essaie de rediriger vers le login, on bloque et renvoie 401
        if response.status_code in [301, 302] and response.url and "/login" in response.url:
            return JsonResponse({"detail": "Authentication required"}, status=401)

        return response

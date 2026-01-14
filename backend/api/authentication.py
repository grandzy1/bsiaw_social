from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Najpierw spróbuj pobrać token z ciasteczka 'access_token'
        raw_token = request.COOKIES.get('access_token')
        
        if raw_token is None:
            return None

        # Walidacja tokena, funkcja "get_validated_token" robi wszystko za nas
        try:
            validated_token = self.get_validated_token(raw_token)

        except AuthenticationFailed:
            return None
        
        return self.get_user(validated_token), validated_token
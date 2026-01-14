from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.conf import settings
import logging

from .models import Profile, Post, Like, Comment
from .serializers import (
    UserSerializer, ProfileSerializer, RegisterSerializer,
    PostSerializer, PostCreateSerializer, CommentSerializer
)

logger = logging.getLogger(__name__)

# Funckja pomocnicza do ustawiania ciasteczek
def set_auth_cookies(response, access_token, refresh_token):
    # Ustawienia bezpieczeństwa ciasteczek
    cookie_params = {
        'httponly': True,  # JS nie ma dostępu (KLUCZOWE!)
        'samesite': 'Lax', # Chroni przed CSRF
        'secure': not settings.DEBUG, # True na produkcji (HTTPS), False lokalnie
        'max_age': 3600 * 24 * 7, # 7 dni
    }
    
    # Ustawiamy access token
    response.set_cookie(
        'access_token', 
        access_token, 
        **cookie_params
    )
    
    # Ustawiamy refresh token
    response.set_cookie(
        'refresh_token', 
        refresh_token, 
        **cookie_params
    )
    return response

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    # Rejestracja użytkownika
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        logger.info(f"AUDIT: Zarejestrowano nowego użytkownika: {user.username} (ID: {user.id}, Email: {user.email})")
        
        # Generuj JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        profile_data = ProfileSerializer(user.profile).data
        
        response = Response({
            'user': profile_data,
            'message': 'Użytkownik utworzony pomyślnie',
        }, status=status.HTTP_201_CREATED)

        set_auth_cookies(response, access_token, refresh_token)
        return response

    logger.warning(f"SECURITY: Nieudana próba rejestracji. Dane: {request.data.get('username')}, Błędy: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    # Logowanie użytkownika
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username i hasło są wymagane'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        logger.warning(f"SECURITY: Nieudane logowanie dla użytkownika: {username}")
        return Response(
            {'error': 'Nieprawidłowe dane logowania'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generuj JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    profile_data = ProfileSerializer(user.profile).data

    logger.info(f"AUDIT: Zalogowano użytkownika: {user.username} (ID: {user.id})")

    # Tworzymy odpowiedź
    response = Response({
        'user': profile_data,
        'message': 'Zalogowano pomyślnie',
        # Nie zwracamy tokenów
    })

    # Doczepiamy ciasteczka
    set_auth_cookies(response, access_token, refresh_token)

    return response


@api_view(['POST'])
@permission_classes([permissions.AllowAny]) # Zezwól każdemu, aby mógł się wylogować (wysłać token do blacklisty)
def logout(request):
    """
    Wylogowanie w oparciu o ciasteczka.
    1. Pobiera refresh token z ciasteczka (jeśli jest).
    2. Wrzuca go na czarną listę.
    3. Usuwa ciasteczka access i refresh z przeglądarki.
    """
    # Przygotuj odpowiedź i pobierz info o użytkowniku (do logów)
    response = Response({'message': 'Wylogowano pomyślnie'}, status=status.HTTP_200_OK)
    user_info = request.user.username if request.user.is_authenticated else "Nieznany/Wygasła sesja"

    # Spróbuj pobrać refresh token z ciasteczka, aby go zablokować
    refresh_token = request.COOKIES.get('refresh_token')

    if refresh_token:
        try:
            # Tworzymy obiekt tokena i wrzucamy na czarną listę w bazie danych
            token = RefreshToken(refresh_token)
            token.blacklist()
        except (TokenError, Exception):
            # Jeśli token jest już nieważny lub zły, ignorujemy to. Użytkownik i tak chce się wylogować.
            pass

    #  Usuń ciasteczka w przeglądarce
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')

    logger.info(f"AUDIT: Wylogowano użytkownika: {user_info}")

    return response

# Nowy widok odświeżania tokena (zastępuje TokenRefreshView z urls.py)
class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Pobierz refresh token z ciasteczka
        refresh_token = request.COOKIES.get('refresh_token')
        user_info = request.user.username if request.user.is_authenticated else "Nieznany/Wygasła sesja"

        if not refresh_token:
            return Response({'error': 'Brak refresh tokena'}, status=401)

        try:
            # Używamy SimpleJWT do odświeżenia
            refresh = RefreshToken(refresh_token)
            
            # Nowy access token
            new_access_token = str(refresh.access_token)

            response = Response({'message': 'Token odświeżony'})
            logger.info(f"AUDIT: Odświeżono access token dla użytkownika: {user_info}")

            # Nadpisz ciasteczko access_token
            response.set_cookie(
                'access_token',
                new_access_token,
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG, # Zmienić na produkcji!!!!!!!!!1
                max_age=3600 # 60 minut
            )
            return response
            
        except TokenError:
            return Response({'error': 'Token nieważny'}, status=401)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """Pobierz dane profilu aktualnie zalogowanego użytkownika"""
    serializer = ProfileSerializer(request.user.profile)
    return Response(serializer.data)


@api_view(['GET'])
@ensure_csrf_cookie
@permission_classes([permissions.AllowAny])
def get_csrf_token(request):
    """Endpoint do pobrania CSRF token"""
    return Response({'detail': 'CSRF cookie set'})


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.select_related('user').all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Profile mogą być publiczne

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        if profile.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Nie masz uprawnień do edycji tego profilu'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related('author').prefetch_related('likes', 'comments').all()
    # POPRAWKA: Zmiana na IsAuthenticated, aby spełnić wymóg
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        return PostSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

    def perform_create(self, serializer):
        instance = serializer.save(author=self.request.user)
        logger.info(f"AUDIT: Użytkownik {self.request.user.username} utworzył POST (ID: {instance.id}). Treść: '{instance.content[:30]}...'")

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        post_id = post.id

        if post.author != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Nie masz uprawnień do usunięcia tego posta'},
                status=status.HTTP_403_FORBIDDEN
            )

        response = super().destroy(request, *args, **kwargs)
        logger.info(f"AUDIT: Użytkownik {request.user.username} usunął POST (ID: {post_id})")
        return response

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        Like.objects.get_or_create(user=request.user, post=post)
        
        post.refresh_from_db()
        serializer = self.get_serializer(post)
        logger.info(f"AUDIT: Użytkownik {request.user.username} POLUBIŁ post {post.id} (Autor posta: {post.author.username})")
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unlike(self, request, pk=None):
        post = self.get_object()
        Like.objects.filter(user=request.user, post=post).delete()
        
        post.refresh_from_db()
        serializer = self.get_serializer(post)
        logger.info(f"AUDIT: Użytkownik {request.user.username} COFNĄŁ POLUBIENIE posta {post.id}")
        return Response(serializer.data, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('author', 'post').all()
    serializer_class = CommentSerializer
    # POPRAWKA: Komentarze też powinny wymagać uwierzytelnienia do odczytu
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(author=self.request.user)
        logger.info(f"AUDIT: Użytkownik {self.request.user.username} skomentował POST {instance.post.id}. Treść: '{instance.content[:30]}...'")

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        comment_id = comment.id
        post_id = comment.post_id

        if comment.author != request.user and not comment.author.is_staff:
            return Response(
                {'error': 'Nie masz uprawnień do usunięcia tego komentarza'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        response = super().destroy(request, *args, **kwargs)
        logger.info(f"AUDIT: Użytkownik {request.user.username} usunął KOMENTARZ {comment_id} z posta {post_id}")
        return response

    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.request.query_params.get('post_id')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset


def health_check(request):
    return HttpResponse("healthy",status=200)

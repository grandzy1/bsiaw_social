from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from .models import Profile, Post, Like, Comment
from .serializers import (
    UserSerializer, ProfileSerializer, RegisterSerializer,
    PostSerializer, PostCreateSerializer, CommentSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """
    Rejestracja nowego użytkownika
    Zwraca JWT tokens w httpOnly cookies
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generuj JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # POPRAWKA LOGIKI: Zwracamy pełny profil, a nie tylko dane usera
        profile_data = ProfileSerializer(user.profile).data
        
        # Przygotuj response
        response = Response({
            'user': profile_data,  # Zwracamy obiekt profilu
            'message': 'Użytkownik utworzony pomyślnie'
        }, status=status.HTTP_201_CREATED)
        
        # Ustaw tokeny w httpOnly cookies
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,   # True w produkcji z HTTPS
            samesite='Lax',
            max_age=3600    # 1 godzina
        )
        
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=604800  # 7 dni
        )
        
        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """
    Logowanie użytkownika
    Zwraca JWT tokens w httpOnly cookies
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username i hasło są wymagane'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Nieprawidłowe dane logowania'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generuj JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    # POPRAWKA LOGIKI: Zwracamy pełny profil
    profile_data = ProfileSerializer(user.profile).data
    
    # Przygotuj response
    response = Response({
        'user': profile_data, # Zwracamy obiekt profilu
        'message': 'Zalogowano pomyślnie'
    })
    
    # Ustaw tokeny w httpOnly cookies
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        secure=False,
        samesite='Lax',
        max_age=3600
    )
    
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite='Lax',
        max_age=604800
    )
    
    return response


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    """
    Wylogowanie - blacklist refresh token i usuń cookies
    """
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except TokenError:
        pass
    
    response = Response({
        'message': 'Wylogowano pomyślnie'
    }, status=status.HTTP_200_OK)
    
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    return response


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    """
    Odśwież access token używając refresh token z cookie
    """
    refresh_token = request.COOKIES.get('refresh_token')
    
    if not refresh_token:
        return Response(
            {'error': 'Refresh token nie znaleziony'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        response = Response({
            'message': 'Token odświeżony'
        })
        
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=3600
        )
        
        return response
        
    except TokenError:
        return Response(
            {'error': 'Nieprawidłowy lub wygasły refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """Pobierz dane profilu aktualnie zalogowanego użytkownika"""
    # POPRAWKA LOGIKI: Zwracamy Profil zamiast User
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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Nie masz uprawnień do usunięcia tego posta'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if created:
            return Response({'message': 'Post polubiony'}, status=status.HTTP_201_CREATED)
        return Response({'message': 'Post już był polubiony'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unlike(self, request, pk=None):
        post = self.get_object()
        deleted_count, _ = Like.objects.filter(user=request.user, post=post).delete()
        
        if deleted_count > 0:
            return Response({'message': 'Polubienie usunięte'}, status=status.HTTP_200_OK)
        return Response({'message': 'Post nie był polubiony'}, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('author', 'post').all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.author != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Nie masz uprawnień do usunięcia tego komentarza'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.request.query_params.get('post_id')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset
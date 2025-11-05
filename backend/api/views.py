from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from base_app.models import Post, Comment
from .serializers import CommentSerializer, PostSerializer, UserSerializer
from django.contrib.auth.models import User

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])  # GET dla wszystkich, POST tylko zalogowani
def post_list(request):
    """
    GET /api/posts/ - zwraca wszystkie posty (publiczne)
    POST /api/posts/ - tworzy nowy post (wymaga logowania)
    """
    if request.method == 'GET':
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            # Zapisz z aktualnie zalogowanym użytkownikiem
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateUserView(generics.CreateAPIView):
    """Rejestracja nowych użytkowników"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def comment_list(request, id):
    """
    GET /api/posts/<id>/comments/ - komentarze do posta (publiczne)
    POST /api/posts/<id>/comments/ - dodawanie komentarza (wymaga logowania)
    """
    post = get_object_or_404(Post, id=id)

    if request.method == 'GET':
        comments = Comment.objects.filter(post=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            # Zapisz z aktualnie zalogowanym użytkownikiem
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Zwraca informacje o aktualnie zalogowanym użytkowniku"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from base_app.models import Post, Comment
from .serializers import CommentSerializer, PostSerializer, UserSerializer
from django.contrib.auth.models import User

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Tymczasowo - później zmienisz na IsAuthenticatedOrReadOnly
def post_list(request):
    """
    GET /api/posts/ - zwraca wszystkie posty
    POST /api/posts/ - tworzy nowy post
    """
    if request.method == 'GET':
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            # MOCK USER - zmienisz na request.user gdy kolega zrobi JWT
            author = User.objects.first()
            if not author:
                # Jeśli nie ma żadnego usera, zwróć błąd
                return Response(
                    {"error": "No users in database. Run: python manage.py createsuperuser"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            serializer.save(author=author)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Napisane jako klasa nie funkcja poniżej

#@api_view(['POST'])
#@permission_classes([AllowAny])
#def register_user(request):
#    """
#    POST /api/users/register/ - tworzy nowego użytkownika (placeholder)
#    """
#    # Tutaj docelowo będzie logika tworzenia użytkownika
#    # np. serializer.is_valid(), serializer.save()
#    return Response({"message": "User registration endpoint works!"}, status=status.HTTP_201_CREATED)

# Rejestracja 
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

#Usuwamy bo jest jako wbudowana funckja z tokenami jwt

#@api_view(['POST'])
#@permission_classes([AllowAny])
#def login_user(request):
#    """
#    POST /api/users/login/ - loguje użytkownika (placeholder)
#    """
#    return Response({"message": "User login endpoint works!"}, status=status.HTTP_200_OK)



@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Tymczasowo - później zmienisz na IsAuthenticatedOrReadOnly
def comment_list(request, id):
    """
    GET /api/posts/<id>/comments/ - komentarze do posta
    POST /api/posts/<id>/comments/ - dodawanie komentarza
    """

    post = get_object_or_404(Post,id=id)

    if request.method == 'GET':
        comments = Comment.objects.filter(post=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            # MOCK USER - zmienisz na request.user gdy kolega zrobi JWT
            author = User.objects.first()
            if not author:
                # Jeśli nie ma żadnego usera, zwróć błąd
                return Response(
                    {"error": "No users in database. Run: python manage.py createsuperuser"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            serializer.save(author=author, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

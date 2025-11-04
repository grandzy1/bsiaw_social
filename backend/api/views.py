from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from base_app.models import Post
from .serializers import PostSerializer
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

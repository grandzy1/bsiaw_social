from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, Post, Like, Comment


class UserSerializer(serializers.ModelSerializer):
    """Serializer dla podstawowych danych użytkownika"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer dla profilu użytkownika"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'bio', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer do rejestracji nowych użytkowników"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Hasła muszą być identyczne."})
        
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Ten adres email jest już używany."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class CommentSerializer(serializers.ModelSerializer):
    """Serializer dla komentarzy"""
    author = UserSerializer(read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_username', 'post', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class PostSerializer(serializers.ModelSerializer):
    """Serializer dla postów"""
    author = UserSerializer(read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_username', 'content', 
            'created_at', 'updated_at', 'likes_count', 
            'comments_count', 'is_liked', 'comments', 'can_delete'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'likes_count', 'comments_count']

    def get_is_liked(self, obj):
        """Sprawdź czy użytkownik polubił ten post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_can_delete(self, obj):
        """Sprawdź czy użytkownik może usunąć ten post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user or request.user.is_staff
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """Uproszczony serializer do tworzenia postów"""
    class Meta:
        model = Post
        fields = ['content']

    def validate_content(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Post nie może być pusty.")
        if len(value) > 280:
            raise serializers.ValidationError("Post nie może mieć więcej niż 280 znaków.")
        return value.strip()


class LikeSerializer(serializers.ModelSerializer):
    """Serializer dla polubień"""
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

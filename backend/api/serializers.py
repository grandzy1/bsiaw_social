from rest_framework import serializers
from base_app.models import Post, Comment
from django.contrib.auth.models import User

class PostSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'content', 'author_id', 'author_username', 'created_at']
        read_only_fields = ['id', 'author_id', 'author_username', 'created_at']
    
    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Content cannot be empty")
        if len(value) > 280:
            raise serializers.ValidationError("Content too long (max 280 characters)")
        return value


class CommentSerializer(serializers.ModelSerializer):
    post = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(), 
        required=False  
    )
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(), 
        required=False, 
        allow_null=True 
    )

    class Meta:
        model = Comment
        fields = ["id", "author", "content", "post", "parent", "created_at"]
        read_only_fields = ['id', 'author', 'created_at']

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    #Deklaracja jakiego modelu używamy oraz jakich informacji (fields) chcemy z tego modelu. Tutaj w fields jeszcze można dodać email - do pomyślenia co chcemy w bazie
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        #Nie wysyłanie hasła z backendu do frontendu 
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        #Uzycie metody Django "create_user" zamiast normalego "create" aby automatycznie hashował hasła przy zapisie do bazy
        user = User.objects.create_user(**validated_data)
        return user
    
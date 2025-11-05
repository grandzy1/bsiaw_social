from rest_framework import serializers
from base_app.models import Post, Comment

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

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Profile, Post, Like, Comment


class ProfileInline(admin.StackedInline):
    """Inline profilu w panelu użytkownika"""
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profil'


class UserAdmin(BaseUserAdmin):
    """Rozszerzony admin użytkowników"""
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')


class PostAdmin(admin.ModelAdmin):
    """Admin postów"""
    list_display = ('id', 'author', 'content_preview', 'likes_count', 'comments_count', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('content', 'author__username')
    readonly_fields = ('created_at', 'updated_at', 'likes_count', 'comments_count')
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        """Skrócony podgląd treści"""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Treść'

    def get_queryset(self, request):
        """Optymalizacja zapytań"""
        qs = super().get_queryset(request)
        return qs.select_related('author')


class LikeAdmin(admin.ModelAdmin):
    """Admin polubień"""
    list_display = ('id', 'user', 'post_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    
    def post_preview(self, obj):
        """Podgląd posta"""
        return f"{obj.post.author.username}: {obj.post.content[:30]}..."
    post_preview.short_description = 'Post'

    def get_queryset(self, request):
        """Optymalizacja zapytań"""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'post', 'post__author')


class CommentAdmin(admin.ModelAdmin):
    """Admin komentarzy"""
    list_display = ('id', 'author', 'post_preview', 'content_preview', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('content', 'author__username', 'post__content')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        """Skrócony podgląd treści"""
        return obj.content[:40] + '...' if len(obj.content) > 40 else obj.content
    content_preview.short_description = 'Treść'
    
    def post_preview(self, obj):
        """Podgląd posta"""
        return f"{obj.post.author.username}: {obj.post.content[:20]}..."
    post_preview.short_description = 'Post'

    def get_queryset(self, request):
        """Optymalizacja zapytań"""
        qs = super().get_queryset(request)
        return qs.select_related('author', 'post', 'post__author')


# Wyrejestruj domyślnego UserAdmin i zarejestruj naszego
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Rejestruj pozostałe modele
admin.site.register(Post, PostAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(Comment, CommentAdmin)

# Dostosowanie nagłówków panelu admin
admin.site.site_header = "Y.com - Panel Administracyjny"
admin.site.site_title = "Y.com Admin"
admin.site.index_title = "Zarządzanie aplikacją Y.com"
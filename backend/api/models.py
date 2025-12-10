from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxLengthValidator
from django.db.models import F

class Profile(models.Model):
    """Rozszerzony profil użytkownika"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profil: {self.user.username}"

    class Meta:
        verbose_name = 'Profil'
        verbose_name_plural = 'Profile'


class Post(models.Model):
    """Model posta (tweeta)"""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(
        max_length=280,
        validators=[MaxLengthValidator(280, message="Post nie może mieć więcej niż 280 znaków")]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Liczniki dla optymalizacji
    likes_count = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}..."

    class Meta:
        verbose_name = 'Post'
        verbose_name_plural = 'Posty'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['author', '-created_at']),
        ]


class Like(models.Model):
    """Model polubień"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Polubienie'
        verbose_name_plural = 'Polubienia'
        unique_together = ('user', 'post')  # Jeden użytkownik może polubić post tylko raz
        indexes = [
            models.Index(fields=['post', 'user']),
        ]

    def __str__(self):
        return f"{self.user.username} polubił post {self.post.id}"


class Comment(models.Model):
    """Model komentarzy"""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Komentarz'
        verbose_name_plural = 'Komentarze'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'created_at']),
        ]

    def __str__(self):
        return f"{self.author.username} -> {self.post.id}: {self.content[:30]}..."


# Sygnały do automatycznej aktualizacji liczników
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


@receiver(post_save, sender=Like)
def increment_likes_count(sender, instance, created, **kwargs):
    """Zwiększ licznik polubień po dodaniu"""
    if created:
        Post.objects.filter(id=instance.post_id).update(likes_count=F('likes_count') + 1)


@receiver(post_delete, sender=Like)
def decrement_likes_count(sender, instance, **kwargs):
    """Zmniejsz licznik polubień po usunięciu"""
    Post.objects.filter(id=instance.post_id).update(likes_count=F('likes_count') - 1)


@receiver(post_save, sender=Comment)
def increment_comments_count(sender, instance, created, **kwargs):
    """Zwiększ licznik komentarzy"""
    if created:
        instance.post.comments_count = instance.post.comments.count()
        instance.post.save(update_fields=['comments_count'])


@receiver(post_delete, sender=Comment)
def decrement_comments_count(sender, instance, **kwargs):
    """Zmniejsz licznik komentarzy"""
    instance.post.comments_count = instance.post.comments.count()
    instance.post.save(update_fields=['comments_count'])


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatyczne tworzenie profilu dla nowego użytkownika"""
    if created:
        Profile.objects.create(user=instance)

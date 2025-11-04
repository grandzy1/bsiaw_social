from django.db import models
from django.conf import settings

# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=32)
    password = models.CharField(max_length=16) 
    priviledge = models.BooleanField()
    
    def __str__(self):
        return self.username

class Post(models.Model):
    content = models.TextField(max_length=280)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']  # najnowsze posty najpierw
        
    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"

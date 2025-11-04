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
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts"
    )
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.content

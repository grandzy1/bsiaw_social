from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
# Create your models here.
# klasa zrobiona do testow, my uzywamy klase dostarczana przez django bo zalatwia za nas rzeczy typu hashowanie hasla
#class User(models.Model):
#   username = models.CharField(max_length=32)
#   password = models.CharField(max_length=16) 
#   priviledge = models.BooleanField()
#   
#   def __str__(self):
#       return self.username

class Post(models.Model):
    content = models.TextField(max_length=280)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']  # najnowsze posty najpierw
        
    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(max_length=200)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    ### W razie odpowiedzi na inny komentarz, ustawić go jako parent (self-reference).
    ### Jeżeli jest to komentarz bezpośrednio pod postem, wartość ustawiona jako null.
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.content
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, get_user_model
from django.contrib.auth import logout,login
from django.http import HttpResponseNotFound
from .forms import PostForm
from .models import Post
def index(request):
    if request.user.is_authenticated:
        posts = Post.objects.all().order_by('-date')
        context = {'posts':posts}
        return render(request, "base_app/index.html", context)
        #return HttpResponse(f"hello {request.user.username}, page index")
    else:
        return render(request,"base_app/landing.html")

def register_page(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("base_app:index")
    else:
        form = UserCreationForm()
    return render(request, "base_app/register.html", {"form": form})

def login_page(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            login(request,form.get_user()) 
            return redirect("base_app:index")
    else:
        form = AuthenticationForm()
    return render(request, "base_app/login.html", { "form": form})

def user_profile(request,username):
    User = get_user_model()
    try:
        User.objects.get(username=username)
        return render(request,"base_app/user.html", { "user": username})
    except User.DoesNotExist:
        return HttpResponseNotFound(f"{username} does not exist")

def add_post(request):
    if request.method == "POST":
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            return redirect("base_app:index")
    else:
        form = PostForm()
    return render(request, 'new_post_form.html', {'form': form})

def view_post(request):
    pass 

def logout_view(request):
    logout(request)
    return HttpResponse("Succesfully logged out, <a href='/'>back to index </a>")

from django.shortcuts import render

def index(request):
    """Render the US States Quiz page."""
    return render(request, 'quiz/index.html')

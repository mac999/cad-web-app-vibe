from django.shortcuts import render
from rest_framework import viewsets
from .models import CadEntity
from .serializers import CadEntitySerializer
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
import json

# Create your views here.

class CadEntityViewSet(viewsets.ModelViewSet):
    queryset = CadEntity.objects.all()
    serializer_class = CadEntitySerializer

def index(request):
    return render(request, 'index.html')

@csrf_exempt
def import_json(request):
    if request.method == 'POST' and request.FILES.get('file'):
        json_file = request.FILES['file']
        data = json.load(json_file)
        for entity_data in data:
            CadEntity.objects.create(**entity_data)
        entities = CadEntity.objects.all()
        serializer = CadEntitySerializer(entities, many=True)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def export_json(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        response = HttpResponse(json.dumps(data, indent=4), content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="entities.json"'
        return response
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'status': 'ok', 'username': user.username})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=400)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def logout_view(request):
    logout(request)
    return JsonResponse({'status': 'ok'})

@csrf_exempt
@login_required
def save_all_entities(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        CadEntity.objects.all().delete()
        for entity_data in data:
            CadEntity.objects.create(**entity_data)
        return JsonResponse({'status': 'ok'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

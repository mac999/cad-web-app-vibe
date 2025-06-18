from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CadEntityViewSet, import_json, export_json

router = DefaultRouter()
router.register(r'entities', CadEntityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('import_JSON/', import_json, name='import_json'),
    path('export_JSON/', export_json, name='export_json'),
]

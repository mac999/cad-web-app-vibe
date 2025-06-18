from rest_framework import serializers
from .models import CadEntity

class CadEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CadEntity
        fields = '__all__'

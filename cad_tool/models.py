from django.db import models

# Create your models here.

class CadEntity(models.Model):
    ENTITY_TYPE_CHOICES = [
        ('Line', 'Line'),
        ('Arc', 'Arc'),
        ('Circle', 'Circle'),
        ('Cube', 'Cube'),
        ('Cylinder', 'Cylinder'),
        ('Sphere', 'Sphere'),
    ]

    entity_type = models.CharField(max_length=10, choices=ENTITY_TYPE_CHOICES)
    name = models.CharField(max_length=255, blank=True, null=True)
    color = models.CharField(max_length=7, default='#ffffff')
    parameters = models.JSONField()

    def __str__(self):
        return f'{self.name} ({self.entity_type})'

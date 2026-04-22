from rest_framework import viewsets

from .models import City
from .serializers import CitySerializer


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all().order_by("state", "city")
    serializer_class = CitySerializer

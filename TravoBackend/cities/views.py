from rest_framework import viewsets

from .models import City
from .serializers import CitySerializer


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all().order_by("state_name", "city")
    serializer_class = CitySerializer

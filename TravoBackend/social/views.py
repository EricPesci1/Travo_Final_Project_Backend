from rest_framework import viewsets

from .models import DimUser, FactReview, Relationship
from .serializers import DimUserSerializer, FactReviewSerializer, RelationshipSerializer


class DimUserViewSet(viewsets.ModelViewSet):
    queryset = DimUser.objects.all().order_by("username")
    serializer_class = DimUserSerializer


class RelationshipViewSet(viewsets.ModelViewSet):
    queryset = Relationship.objects.select_related("requester", "addressee").all()
    serializer_class = RelationshipSerializer


class FactReviewViewSet(viewsets.ModelViewSet):
    queryset = FactReview.objects.select_related("user", "city").all()
    serializer_class = FactReviewSerializer

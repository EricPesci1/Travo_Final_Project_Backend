from django.db.models import Q
from rest_framework import viewsets

from .models import DimUser, FactReview, Relationship
from .serializers import DimUserSerializer, FactReviewSerializer, RelationshipSerializer


class DimUserViewSet(viewsets.ModelViewSet):
    serializer_class = DimUserSerializer

    def get_queryset(self):
        queryset = DimUser.objects.all().order_by("username")
        username = self.request.query_params.get("username")
        if username:
            queryset = queryset.filter(username__icontains=username)
        return queryset


class RelationshipViewSet(viewsets.ModelViewSet):
    serializer_class = RelationshipSerializer

    def get_queryset(self):
        queryset = Relationship.objects.select_related("requester", "addressee").all()
        user_id = self.request.query_params.get("user")
        status = self.request.query_params.get("status")

        if user_id:
            queryset = queryset.filter(Q(requester_id=user_id) | Q(addressee_id=user_id))
        if status:
            queryset = queryset.filter(status=status)

        return queryset.order_by("-date_sent")


class FactReviewViewSet(viewsets.ModelViewSet):
    serializer_class = FactReviewSerializer

    def get_queryset(self):
        queryset = FactReview.objects.select_related("user", "city").all()
        user_id = self.request.query_params.get("user")
        username = self.request.query_params.get("username")
        city_id = self.request.query_params.get("city")
        state_name = self.request.query_params.get("state")

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if username:
            queryset = queryset.filter(user__username=username)
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        if state_name:
            queryset = queryset.filter(city__state_name__iexact=state_name)

        return queryset.order_by("-created_at")

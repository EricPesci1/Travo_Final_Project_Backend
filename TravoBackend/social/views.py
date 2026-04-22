from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from cities.models import City
from .models import DimUser, FactReview, Relationship
from .serializers import DimUserSerializer, FactReviewSerializer, RelationshipSerializer


class DimUserViewSet(viewsets.ModelViewSet):
    queryset = DimUser.objects.all().order_by("username")
    serializer_class = DimUserSerializer


class RelationshipViewSet(viewsets.ModelViewSet):
    queryset = Relationship.objects.select_related("requester", "addressee").all()
    serializer_class = RelationshipSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        username = (self.request.query_params.get("username") or "").strip()
        if username:
            qs = qs.filter(
                requester__username=username,
            ) | qs.filter(addressee__username=username)
        return qs

    def create(self, request, *args, **kwargs):
        """
        Accepts the normal serializer payload (requester, addressee as PKs), but also:
          - requester_username: string (creates/uses DimUser)
          - addressee_username: string (creates/uses DimUser)
        """
        data = request.data.copy()

        requester_username = (data.get("requester_username") or "").strip()
        addressee_username = (data.get("addressee_username") or "").strip()

        if requester_username and not data.get("requester"):
            requester, _ = DimUser.objects.get_or_create(
                username=requester_username,
                defaults={
                    "first_name": requester_username.split(".")[0].title()
                    if "." in requester_username
                    else requester_username.title(),
                    "last_name": "User",
                    "email": f"{requester_username}@example.com",
                },
            )
            data["requester"] = requester.user_key

        if addressee_username and not data.get("addressee"):
            addressee, _ = DimUser.objects.get_or_create(
                username=addressee_username,
                defaults={
                    "first_name": addressee_username.split(".")[0].title()
                    if "." in addressee_username
                    else addressee_username.title(),
                    "last_name": "User",
                    "email": f"{addressee_username}@example.com",
                },
            )
            data["addressee"] = addressee.user_key

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class FactReviewViewSet(viewsets.ModelViewSet):
    queryset = FactReview.objects.select_related("user", "city").all()
    serializer_class = FactReviewSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        username = (self.request.query_params.get("username") or "").strip()
        if username:
            qs = qs.filter(user__username=username)
        return qs

    def create(self, request, *args, **kwargs):
        """
        Accepts the normal serializer payload (user, city as PKs), but also a
        frontend-friendly payload:
          - username: string (creates/uses DimUser)
          - city_name: string
          - state_name: string
        """
        data = request.data.copy()

        username = (data.get("username") or "").strip()
        city_name = (data.get("city_name") or "").strip()
        state_name = (data.get("state_name") or "").strip()

        if username and not data.get("user"):
            user, _created = DimUser.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": username.split(".")[0].title() if "." in username else username.title(),
                    "last_name": "User",
                    "email": f"{username}@example.com",
                },
            )
            data["user"] = user.user_key

        if (city_name or state_name) and not data.get("city"):
            if not (city_name and state_name):
                raise ValidationError({"city_name": "city_name and state_name are required together."})
            city = (
                City.objects.filter(city__iexact=city_name, state_name__iexact=state_name)
                .order_by("id")
                .first()
            )
            if not city:
                raise ValidationError({"city": f'No city found for "{city_name}, {state_name}".'})
            data["city"] = city.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

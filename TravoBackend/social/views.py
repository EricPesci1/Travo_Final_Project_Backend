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

        # Accept common frontend key names.
        data["requester"] = data.get("requester") or data.get("requester_id") or data.get("requesterId")
        data["addressee"] = data.get("addressee") or data.get("addressee_id") or data.get("addresseeId")

        requester_username = (data.get("requester_username") or data.get("requesterUsername") or "").strip()
        addressee_username = (data.get("addressee_username") or data.get("addresseeUsername") or "").strip()

        # Alternate payload: { "username": "...", "friend_username": "..." }
        if not requester_username:
            requester_username = (data.get("username") or "").strip()
        if not addressee_username:
            addressee_username = (data.get("friend_username") or data.get("friendUsername") or "").strip()

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

        if data.get("requester") and data.get("addressee") and str(data["requester"]) == str(data["addressee"]):
            raise ValidationError({"addressee": "You cannot friend yourself."})

        if data.get("requester") and data.get("addressee"):
            existing = Relationship.objects.filter(
                requester_id=data["requester"],
                addressee_id=data["addressee"],
            ).exists() or Relationship.objects.filter(
                requester_id=data["addressee"],
                addressee_id=data["requester"],
            ).exists()
            if existing:
                raise ValidationError({"detail": "A relationship between these users already exists."})

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
          - state: string
        """
        data = request.data.copy()

        # Accept common frontend key names.
        data["user"] = data.get("user") or data.get("user_id") or data.get("userId")
        data["city"] = data.get("city") or data.get("city_id") or data.get("cityId")
        data["date_start"] = data.get("date_start") or data.get("dateStart")
        data["date_end"] = data.get("date_end") or data.get("dateEnd")

        username = (data.get("username") or "").strip()
        city_name = (data.get("city_name") or data.get("cityName") or "").strip()
        state = (data.get("state") or data.get("state_name") or data.get("stateName") or "").strip()

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

        if (city_name or state) and not data.get("city"):
            if not (city_name and state):
                raise ValidationError({"city_name": "city_name and state are required together."})
            city = (
                City.objects.filter(city__iexact=city_name, state__iexact=state)
                .order_by("id")
                .first()
            )
            if not city:
                raise ValidationError({"city": f'No city found for "{city_name}, {state}".'})
            data["city"] = city.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

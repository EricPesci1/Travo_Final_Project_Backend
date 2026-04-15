"""
Single DRF router for the whole API (cities + social models).
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from cities.views import CityViewSet
from social.views import DimUserViewSet, FactReviewViewSet, RelationshipViewSet

router = DefaultRouter()
router.register("cities", CityViewSet, basename="city")
router.register("dim-users", DimUserViewSet, basename="dim-user")
router.register("relationships", RelationshipViewSet, basename="relationship")
router.register("reviews", FactReviewViewSet, basename="review")

urlpatterns = [
    path("", include(router.urls)),
]

from rest_framework import serializers

from .models import DimUser, FactReview, Relationship


class DimUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = DimUser
        fields = [
            "user_key",
            "username",
            "last_name",
            "first_name",
            "phone_number",
            "date_created",
            "email",
        ]
        read_only_fields = ["user_key", "date_created"]


class RelationshipSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    addressee_username = serializers.CharField(source="addressee.username", read_only=True)

    class Meta:
        model = Relationship
        fields = [
            "id",
            "requester",
            "requester_username",
            "addressee",
            "addressee_username",
            "status",
            "date_sent",
        ]
        read_only_fields = ["date_sent"]


class FactReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    city_name = serializers.CharField(source="city.city", read_only=True)
    state_name = serializers.CharField(source="city.state_name", read_only=True)

    class Meta:
        model = FactReview
        fields = [
            "id",
            "user",
            "user_username",
            "rating",
            "description",
            "city",
            "city_name",
            "state_name",
            "created_at",
            "pros",
            "cons",
            "date_start",
            "date_end",
        ]
        read_only_fields = ["created_at"]

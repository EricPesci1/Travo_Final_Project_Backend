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
    class Meta:
        model = Relationship
        fields = ["id", "requester", "addressee", "status", "date_sent"]
        read_only_fields = ["date_sent"]


class FactReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = FactReview
        fields = [
            "id",
            "user",
            "rating",
            "description",
            "city",
            "created_at",
            "pros",
            "cons",
            "date_start",
            "date_end",
        ]
        read_only_fields = ["created_at"]

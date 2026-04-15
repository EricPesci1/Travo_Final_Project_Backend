from django.contrib import admin

from .models import DimUser, FactReview, Relationship


@admin.register(DimUser)
class DimUserAdmin(admin.ModelAdmin):
    list_display = ("user_key", "username", "email", "first_name", "last_name", "date_created")
    search_fields = ("username", "email", "first_name", "last_name")


@admin.register(Relationship)
class RelationshipAdmin(admin.ModelAdmin):
    list_display = ("id", "requester", "addressee", "status", "date_sent")
    list_filter = ("status",)


@admin.register(FactReview)
class FactReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "city", "rating", "created_at")
    list_filter = ("rating",)

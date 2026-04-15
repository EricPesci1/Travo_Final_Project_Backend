from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class DimUser(models.Model):
    """
    Application user profile (star-schema Dim_User).
    """

    user_key = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    last_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=50, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(max_length=254)

    class Meta:
        db_table = "dim_user"
        ordering = ["username"]

    def __str__(self):
        return self.username


class Relationship(models.Model):
    """
    Friend / connection requests between users (Relationships).
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        BLOCKED = "blocked", "Blocked"

    requester = models.ForeignKey(
        DimUser,
        on_delete=models.CASCADE,
        related_name="outgoing_relationships",
    )
    addressee = models.ForeignKey(
        DimUser,
        on_delete=models.CASCADE,
        related_name="incoming_relationships",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    date_sent = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "relationships"
        constraints = [
            models.UniqueConstraint(
                fields=["requester", "addressee"],
                name="unique_relationship_requester_addressee",
            ),
            models.CheckConstraint(
                condition=~models.Q(requester=models.F("addressee")),
                name="relationship_not_self",
            ),
        ]
        ordering = ["-date_sent"]

    def __str__(self):
        return f"{self.requester_id} → {self.addressee_id} ({self.status})"


class FactReview(models.Model):
    """
    Travel review for a destination (Fact_Review).
    """

    user = models.ForeignKey(
        DimUser,
        on_delete=models.CASCADE,
        related_name="reviews",
        db_column="user_key",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    description = models.TextField()
    city = models.ForeignKey(
        "cities.City",
        on_delete=models.PROTECT,
        related_name="reviews",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    pros = models.TextField(blank=True)
    cons = models.TextField(blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "fact_review"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} → {self.city} ({self.rating})"

from django.db import models


class City(models.Model):
    city = models.CharField(max_length=100)
    state_name = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=9, decimal_places=4)
    lng = models.DecimalField(max_digits=9, decimal_places=4)

    class Meta:
        db_table = "cities"

    def __str__(self):
        return f"{self.city}, {self.state_name}"

import csv
from decimal import Decimal
from pathlib import Path

from django.db import migrations


def reload_cities_data(apps, schema_editor):
    City = apps.get_model("cities", "City")
    csv_path = Path(__file__).resolve().parents[3] / "CitiesData" / "uscities.csv"

    if not csv_path.exists():
        return

    City.objects.all().delete()

    records = []
    batch_size = 2000

    with csv_path.open(newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            records.append(
                City(
                    city=row["city"],
                    state=row["state_name"],
                    lat=Decimal(row["lat"]),
                    lng=Decimal(row["lng"]),
                )
            )
            if len(records) >= batch_size:
                City.objects.bulk_create(records, batch_size=batch_size)
                records = []

    if records:
        City.objects.bulk_create(records, batch_size=batch_size)


def unload_cities_data(apps, schema_editor):
    City = apps.get_model("cities", "City")
    City.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("cities", "0002_load_cities_data"),
    ]

    operations = [
        migrations.RenameField(
            model_name="city",
            old_name="state_name",
            new_name="state",
        ),
        migrations.RunPython(reload_cities_data, unload_cities_data),
    ]

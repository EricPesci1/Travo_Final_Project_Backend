import random

from django.core.management.base import BaseCommand
from django.db import transaction

from cities.models import City
from social.models import DimUser, FactReview

USERS = [
    {"username": "alex.rivera",   "first_name": "Alex",    "last_name": "Rivera",   "email": "alex.rivera@example.com"},
    {"username": "jamie.chen",    "first_name": "Jamie",   "last_name": "Chen",     "email": "jamie.chen@example.com"},
    {"username": "morgan.smith",  "first_name": "Morgan",  "last_name": "Smith",    "email": "morgan.smith@example.com"},
    {"username": "taylor.nguyen", "first_name": "Taylor",  "last_name": "Nguyen",   "email": "taylor.nguyen@example.com"},
    {"username": "jordan.kim",    "first_name": "Jordan",  "last_name": "Kim",      "email": "jordan.kim@example.com"},
    {"username": "casey.patel",   "first_name": "Casey",   "last_name": "Patel",    "email": "casey.patel@example.com"},
    {"username": "riley.johnson", "first_name": "Riley",   "last_name": "Johnson",  "email": "riley.johnson@example.com"},
    {"username": "drew.martinez", "first_name": "Drew",    "last_name": "Martinez", "email": "drew.martinez@example.com"},
    {"username": "quinn.lee",     "first_name": "Quinn",   "last_name": "Lee",      "email": "quinn.lee@example.com"},
    {"username": "avery.wilson",  "first_name": "Avery",   "last_name": "Wilson",   "email": "avery.wilson@example.com"},
]

REVIEWS = [
    {
        "rating": 5,
        "description": "One of the best cities I've ever visited. The energy here is unlike anywhere else — great food, culture, and people.",
        "pros": "Amazing food scene\nVibrant nightlife\nFriendly locals\nGreat public transit",
        "cons": "Can get crowded\nHigher cost of living",
    },
    {
        "rating": 4,
        "description": "Really enjoyed my time here. Lots to do and see, and the weather was perfect for exploring on foot.",
        "pros": "Beautiful architecture\nPlenty of parks\nWalkable downtown",
        "cons": "Parking is a nightmare\nSome areas feel touristy",
    },
    {
        "rating": 3,
        "description": "Decent place to visit for a weekend. Nothing that blew me away, but solid overall with some hidden gems if you dig around.",
        "pros": "Affordable hotels\nGood local breweries\nEasy to navigate",
        "cons": "Limited public transit\nNot much to do after dark",
    },
    {
        "rating": 4,
        "description": "Surprised by how much I loved it here. Underrated destination with a lot of character and a great local food scene.",
        "pros": "Underrated gem\nGreat local restaurants\nLow crowds",
        "cons": "Weather can be unpredictable\nFlight options are limited",
    },
    {
        "rating": 5,
        "description": "Absolutely stunning. Every corner had something new to discover. I will definitely be coming back.",
        "pros": "Gorgeous scenery\nExcellent museums\nSafe and clean\nGreat coffee shops",
        "cons": "Pricey accommodations\nBusy in summer",
    },
    {
        "rating": 2,
        "description": "Not really my kind of place. Felt a bit run-down in spots and there wasn't much going on outside of the main strip.",
        "pros": "Cheap to visit\nInteresting history",
        "cons": "Limited dining options\nNot very walkable\nFelt unsafe at night",
    },
    {
        "rating": 4,
        "description": "Great city for outdoor lovers. Tons of hiking, biking, and nature right at your doorstep without sacrificing urban amenities.",
        "pros": "Outdoor activities everywhere\nFarm-to-table food scene\nClean air",
        "cons": "Can get cold\nSome areas lack public transit",
    },
    {
        "rating": 3,
        "description": "Had a mixed experience. Great highlights but some logistical headaches made it harder to fully enjoy. Worth it for the culture though.",
        "pros": "Rich cultural scene\nUnique architecture\nGreat street food",
        "cons": "Traffic is awful\nHard to find parking\nExpensive taxis",
    },
    {
        "rating": 5,
        "description": "A dream destination. Came for a week and wished I had more time. The locals were incredibly welcoming and the food was world-class.",
        "pros": "World-class food\nBeautiful waterfront\nGreat weather\nWelcoming locals",
        "cons": "Expensive\nCrowded tourist spots",
    },
    {
        "rating": 3,
        "description": "Fun for a short trip but I wouldn't stay longer than a few days. Good for families but a little slow-paced for my taste.",
        "pros": "Family friendly\nAffordable\nClean and safe",
        "cons": "Not much nightlife\nLimited dining variety\nCan feel sleepy",
    },
]


class Command(BaseCommand):
    help = "Seed 10 demo users with 2 reviews each for app demos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete existing demo users and their reviews before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["clear"]:
            usernames = [u["username"] for u in USERS]
            deleted, _ = DimUser.objects.filter(username__in=usernames).delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted} existing demo records."))

        cities = list(City.objects.all())
        if not cities:
            self.stderr.write(self.style.ERROR("No cities in the database. Run migrations first."))
            return

        review_pool = REVIEWS.copy()
        random.shuffle(review_pool)
        review_index = 0

        for user_data in USERS:
            user, created = DimUser.objects.get_or_create(
                username=user_data["username"],
                defaults={
                    "first_name": user_data["first_name"],
                    "last_name":  user_data["last_name"],
                    "email":      user_data["email"],
                },
            )
            status = "created" if created else "already exists"
            self.stdout.write(f"  User {user.username} ({status})")

            if not created:
                continue

            chosen_cities = random.sample(cities, k=min(2, len(cities)))
            for city in chosen_cities:
                template = review_pool[review_index % len(review_pool)]
                review_index += 1
                FactReview.objects.create(
                    user=user,
                    city=city,
                    rating=template["rating"],
                    description=template["description"],
                    pros=template["pros"],
                    cons=template["cons"],
                )
                self.stdout.write(f"    + Review for {city.city}, {city.state} (rating {template['rating']})")

        self.stdout.write(self.style.SUCCESS("\nDone. Demo data seeded successfully."))

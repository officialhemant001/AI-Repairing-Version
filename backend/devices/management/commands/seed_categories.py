"""
Management command to seed the database with default device categories.
"""
from django.core.management.base import BaseCommand
from devices.models import DeviceCategory


DEFAULT_CATEGORIES = [
    {'name': 'Mobile', 'slug': 'mobile', 'icon': '📱', 'display_order': 1},
    {'name': 'Laptop', 'slug': 'laptop', 'icon': '💻', 'display_order': 2},
    {'name': 'Desktop', 'slug': 'desktop', 'icon': '🖥️', 'display_order': 3},
    {'name': 'Television', 'slug': 'television', 'icon': '📺', 'display_order': 4},
    {'name': 'Air Conditioner', 'slug': 'air-conditioner', 'icon': '🌡️', 'display_order': 5},
    {'name': 'Refrigerator', 'slug': 'refrigerator', 'icon': '🧊', 'display_order': 6},
    {'name': 'Washing Machine', 'slug': 'washing-machine', 'icon': '🫧', 'display_order': 7},
    {'name': 'Printer', 'slug': 'printer', 'icon': '🖨️', 'display_order': 8},
    {'name': 'Router', 'slug': 'router', 'icon': '📡', 'display_order': 9},
    {'name': 'Ceiling Fan', 'slug': 'ceiling-fan', 'icon': '🪭', 'display_order': 10},
    {'name': 'Cooler', 'slug': 'cooler', 'icon': '❄️', 'display_order': 11},
    {'name': 'Water Pump', 'slug': 'water-pump', 'icon': '💧', 'display_order': 12},
    {'name': 'Mixer Grinder', 'slug': 'mixer-grinder', 'icon': '🔌', 'display_order': 13},
    {'name': 'Microwave', 'slug': 'microwave', 'icon': '🍳', 'display_order': 14},
    {'name': 'Electric Iron', 'slug': 'electric-iron', 'icon': '👔', 'display_order': 15},
    {'name': 'Geyser', 'slug': 'geyser', 'icon': '🔥', 'display_order': 16},
    {'name': 'Other', 'slug': 'other', 'icon': '⚡', 'display_order': 99},
]


class Command(BaseCommand):
    help = 'Seed the database with default device categories'

    def handle(self, *args, **options):
        created_count = 0
        for cat_data in DEFAULT_CATEGORIES:
            _, created = DeviceCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data,
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  [Created]: {cat_data["name"]}'))
            else:
                self.stdout.write(f'  — Exists: {cat_data["name"]}')

        self.stdout.write(
            self.style.SUCCESS(f'\nDone! Created {created_count} new categories.')
        )

from django.core.management.base import BaseCommand
from courses.models import Lesson, KeyTakeaway

class Command(BaseCommand):
    help = "Add default key takeaways to lessons that don't have any"

    def handle(self, *args, **options):
        # Find lessons without takeaways
        lessons_without = Lesson.objects.filter(takeaways__isnull=True).distinct()
        
        self.stdout.write(self.style.NOTICE(f"Found {lessons_without.count()} lessons without takeaways"))
        
        # Add takeaways to them
        takeaway_templates = [
            "Understand the core concepts and key ideas presented in this lesson",
            "Learn how to apply the concepts in practical scenarios",
            "Be able to identify and explain the main principles"
        ]

        count = 0
        for lesson in lessons_without:
            for order, template in enumerate(takeaway_templates, start=1):
                KeyTakeaway.objects.create(
                    lesson=lesson,
                    content=f"{template} in {lesson.title}",
                    order=order
                )
                count += 1
            self.stdout.write(self.style.SUCCESS(f"  ✓ Added {len(takeaway_templates)} takeaways to: {lesson.title}"))

        self.stdout.write(self.style.SUCCESS(f"\n✨ Complete! Added {count} key takeaways total"))

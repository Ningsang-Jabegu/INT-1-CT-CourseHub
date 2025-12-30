from django.core.management.base import BaseCommand
from courses.models import Course, Lesson, Topic, KeyTakeaway

DEFAULT_TAKEAWAYS = [
    "Summarize the most important concept from this section.",
    "Identify one practical application you can try today.",
    "Write down a question you still have after learning this.",
]

class Command(BaseCommand):
    help = "Seed Key Takeaways for all lessons and topics that don't have any"

    def handle(self, *args, **options):
        created_count = 0
        for course in Course.objects.all():
            self.stdout.write(self.style.NOTICE(f"Processing course: {course.title}"))
            # Lessons
            for lesson in Lesson.objects.filter(module__course=course):
                if not KeyTakeaway.objects.filter(lesson=lesson).exists():
                    for idx, content in enumerate(DEFAULT_TAKEAWAYS, start=1):
                        KeyTakeaway.objects.create(lesson=lesson, content=content, order=idx)
                        created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Added {len(DEFAULT_TAKEAWAYS)} takeaways to lesson: {lesson.title}"))
                else:
                    self.stdout.write(self.style.WARNING(f"  • Lesson already has takeaways: {lesson.title}"))
            # Topics
            for topic in Topic.objects.filter(lesson__module__course=course):
                if not KeyTakeaway.objects.filter(topic=topic).exists():
                    for idx, content in enumerate(DEFAULT_TAKEAWAYS, start=1):
                        KeyTakeaway.objects.create(topic=topic, content=content, order=idx)
                        created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Added {len(DEFAULT_TAKEAWAYS)} takeaways to topic: {topic.title}"))
                else:
                    self.stdout.write(self.style.WARNING(f"  • Topic already has takeaways: {topic.title}"))

        self.stdout.write(self.style.SUCCESS(f"Done. Created {created_count} key takeaways in total."))

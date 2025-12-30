from django.core.management.base import BaseCommand

from courses.models import Course, Lesson, Module


class Command(BaseCommand):
    help = "Seed three dummy courses with one module and one lesson each"

    def handle(self, *args, **options):
        seeds = [
            {
                "title": "सामाजिक अध्ययन (डेमो)",
                "description": "डेमो सामग्री: सामाजिक सीप, नागरिकता र सुशासन",
                "modules": [
                    {
                        "title": "परिचय",
                        "description": "मुख्य अवधारणाहरूको संक्षिप्त परिचय",
                        "lessons": [
                            {
                                "title": "सामाजिक सीप के हो?",
                                "content": "सामाजिक सीपले प्रभावकारी संचार, सहकार्य र निर्णय क्षमता विकास गर्छ।",
                            }
                        ],
                    }
                ],
            },
            {
                "title": "ICT Foundations (Demo)",
                "description": "Demo content covering basic IT literacy and digital citizenship.",
                "modules": [
                    {
                        "title": "Digital Basics",
                        "description": "Hardware, software, networking essentials",
                        "lessons": [
                            {
                                "title": "What is a Computer?",
                                "content": "Overview of hardware components, OS, and common applications.",
                            }
                        ],
                    }
                ],
            },
            {
                "title": "Entrepreneurship 101 (Demo)",
                "description": "Demo content on idea validation and business basics.",
                "modules": [
                    {
                        "title": "Getting Started",
                        "description": "Problem discovery and solution fit",
                        "lessons": [
                            {
                                "title": "Finding a Problem",
                                "content": "Identify pain points, validate with users, and scope an MVP.",
                            }
                        ],
                    }
                ],
            },
        ]

        created = 0
        for seed in seeds:
            course, course_created = Course.objects.get_or_create(
                title=seed["title"], defaults={"description": seed["description"]}
            )
            if course_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created course: {course.title}"))
            else:
                self.stdout.write(f"Course already exists: {course.title}")

            # ensure modules/lessons exist
            for m_order, module_seed in enumerate(seed["modules"], start=1):
                module, module_created = Module.objects.get_or_create(
                    course=course,
                    title=module_seed["title"],
                    defaults={"description": module_seed["description"], "order": m_order},
                )
                if module_created:
                    self.stdout.write(f"  Added module: {module.title}")

                for l_order, lesson_seed in enumerate(module_seed["lessons"], start=1):
                    lesson, lesson_created = Lesson.objects.get_or_create(
                        module=module,
                        title=lesson_seed["title"],
                        defaults={"content": lesson_seed["content"], "order": l_order},
                    )
                    if lesson_created:
                        self.stdout.write(f"    Added lesson: {lesson.title}")

        if created == 0:
            self.stdout.write(self.style.WARNING("No new courses created (they already exist)."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Seeded {created} new courses."))

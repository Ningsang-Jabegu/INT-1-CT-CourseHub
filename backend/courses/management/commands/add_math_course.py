from django.core.management.base import BaseCommand
from courses.models import Course, Module, Lesson, Topic


class Command(BaseCommand):
    help = "Add a Mathematics course with modules, lessons, and topics including equations"

    def handle(self, *args, **options):
        course, created = Course.objects.get_or_create(
            title="Mathematics Foundations",
            defaults={"description": "Core mathematical concepts with formulas and problem-solving."},
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created course: {course.title}"))
        else:
            self.stdout.write(self.style.WARNING(f"Course already exists: {course.title}"))

        modules = [
            {
                "title": "Algebra Basics",
                "description": "Expressions, equations, and linear functions.",
                "lessons": [
                    {"title": "Variables and Expressions", "topics": ["Order of Operations", "Combining Like Terms"]},
                    {"title": "Linear Equations", "topics": ["Solving One-Step", "Solving Two-Step"]},
                    {"title": "Linear Functions", "topics": ["Slope-Intercept Form", "Point-Slope Form"]},
                ],
            },
            {
                "title": "Geometry Essentials",
                "description": "Shapes, angles, and theorems.",
                "lessons": [
                    {"title": "Triangles and Angles", "topics": ["Interior Angles", "Exterior Angles"]},
                    {"title": "Circles", "topics": ["Arc Length", "Sector Area"]},
                    {"title": "Area and Perimeter", "topics": ["Polygons", "Composite Figures"]},
                ],
            },
            {
                "title": "Trigonometry",
                "description": "Ratios, identities, and applications.",
                "lessons": [
                    {"title": "Right Triangle Trigonometry", "topics": ["SOH-CAH-TOA", "Inverse Trig"]},
                    {"title": "Unit Circle", "topics": ["Radians", "Reference Angles"]},
                    {"title": "Trig Identities", "topics": ["Pythagorean Identities", "Angle Sum"]},
                ],
            },
            {
                "title": "Calculus Introduction",
                "description": "Limits, derivatives, and integrals.",
                "lessons": [
                    {"title": "Limits and Continuity", "topics": ["Limit Laws", "One-Sided Limits"]},
                    {"title": "Derivatives", "topics": ["Power Rule", "Product and Quotient Rules", "Chain Rule"]},
                    {"title": "Integrals", "topics": ["Area Under Curve", "Basic Antiderivatives"]},
                ],
            },
            {
                "title": "Probability and Statistics",
                "description": "Data, distributions, and chance.",
                "lessons": [
                    {"title": "Descriptive Statistics", "topics": ["Mean, Median, Mode", "Variance and SD"]},
                    {"title": "Probability Basics", "topics": ["Sample Spaces", "Conditional Probability"]},
                    {"title": "Discrete Distributions", "topics": ["Binomial", "Geometric"]},
                    {"title": "Normal Distribution", "topics": ["Z-Scores", "Empirical Rule"]},
                ],
            },
        ]

        module_count = lesson_count = topic_count = 0

        for m_order, m in enumerate(modules, start=1):
            module, m_created = Module.objects.get_or_create(
                course=course,
                title=m["title"],
                defaults={"description": m.get("description", ""), "order": m_order},
            )
            if m_created:
                module_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Added module: {module.title}"))
            else:
                self.stdout.write(self.style.WARNING(f"  Module exists: {module.title}"))

            for l_order, lesson_data in enumerate(m.get("lessons", []), start=1):
                lesson, l_created = Lesson.objects.get_or_create(
                    module=module,
                    title=lesson_data["title"],
                    defaults={
                        "content": self._build_lesson_content(lesson_data["title"]),
                        "order": l_order,
                    },
                )
                if l_created:
                    lesson_count += 1
                    self.stdout.write(f"    • Added lesson: {lesson.title}")
                else:
                    self.stdout.write(f"    • Lesson exists: {lesson.title}")

                for t_order, topic_title in enumerate(lesson_data.get("topics", [])[:3], start=1):
                    topic, t_created = Topic.objects.get_or_create(
                        lesson=lesson,
                        title=topic_title,
                        defaults={
                            "content": self._build_topic_content(topic_title),
                            "order": t_order,
                        },
                    )
                    if t_created:
                        topic_count += 1
                        self.stdout.write(f"      - Added topic: {topic.title}")

        self.stdout.write(self.style.SUCCESS("\nDone."))
        self.stdout.write(f"Modules added: {module_count}")
        self.stdout.write(f"Lessons added: {lesson_count}")
        self.stdout.write(f"Topics added: {topic_count}")

    def _build_lesson_content(self, title: str) -> str:
        # Include simple math formatting; frontend can render HTML/LaTeX via existing rich text
        samples = {
            "Linear Equations": "Example: Solve 2x + 5 = 17 → x = 6.",
            "Derivatives": "Derivative of x^n is n·x^{n-1}. Example: d/dx (x^3) = 3x^2.",
            "Integrals": "∫ x^n dx = x^{n+1}/(n+1) + C. Example: ∫ x^2 dx = x^3/3 + C.",
            "Probability Basics": "P(A∩B) = P(A)P(B|A).",
        }
        return samples.get(title, f"Introduction to {title} with examples and practice problems.")

    def _build_topic_content(self, title: str) -> str:
        samples = {
            "Slope-Intercept Form": "y = mx + b. m is slope, b is y-intercept.",
            "Radians": "π radians = 180°. So 1 rad ≈ 57.3°.",
            "Pythagorean Identities": "sin^2 θ + cos^2 θ = 1.",
            "Z-Scores": "z = (x - μ)/σ describes how many standard deviations x is from the mean.",
        }
        return samples.get(title, f"Key ideas and worked examples for {title}.")

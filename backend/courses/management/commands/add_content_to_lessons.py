from django.core.management.base import BaseCommand
from courses.models import Lesson, Topic, KeyTakeaway, Exercise, Resource

class Command(BaseCommand):
    help = "Populate key takeaways, exercises, and resources for existing lessons and topics"

    def handle(self, *args, **options):
        total_takeaways = 0
        total_exercises = 0
        total_resources = 0

        # Process all lessons
        lessons = Lesson.objects.all()
        self.stdout.write(self.style.NOTICE(f"\n📖 Processing {lessons.count()} lessons..."))
        
        for lesson in lessons:
            # Add key takeaways if missing
            if not KeyTakeaway.objects.filter(lesson=lesson).exists():
                takeaways = self._get_takeaways_for_lesson(lesson.title)
                for order, takeaway in enumerate(takeaways, start=1):
                    KeyTakeaway.objects.create(
                        lesson=lesson,
                        content=takeaway,
                        order=order
                    )
                    total_takeaways += 1
                self.stdout.write(f"  ✓ Added {len(takeaways)} takeaways to: {lesson.title}")
            
            # Add exercises if missing
            if not Exercise.objects.filter(lesson=lesson).exists():
                exercises = self._get_exercises_for_lesson(lesson.title)
                for order, exercise in enumerate(exercises, start=1):
                    Exercise.objects.create(
                        lesson=lesson,
                        title=exercise['title'],
                        description=exercise['description'],
                        order=order
                    )
                    total_exercises += 1
                if exercises:
                    self.stdout.write(f"  ✓ Added {len(exercises)} exercises to: {lesson.title}")
            
            # Add resources if missing
            if not Resource.objects.filter(lesson=lesson).exists():
                resources = self._get_resources_for_lesson(lesson.title)
                for order, resource in enumerate(resources, start=1):
                    Resource.objects.create(
                        lesson=lesson,
                        title=resource['title'],
                        description=resource['description'],
                        url=resource['url'],
                        order=order
                    )
                    total_resources += 1
                if resources:
                    self.stdout.write(f"  ✓ Added {len(resources)} resources to: {lesson.title}")

        # Process all topics
        topics = Topic.objects.all()
        self.stdout.write(self.style.NOTICE(f"\n📝 Processing {topics.count()} topics..."))
        
        for topic in topics:
            # Add key takeaways if missing
            if not KeyTakeaway.objects.filter(topic=topic).exists():
                takeaways = self._get_takeaways_for_topic(topic.title)
                for order, takeaway in enumerate(takeaways, start=1):
                    KeyTakeaway.objects.create(
                        topic=topic,
                        content=takeaway,
                        order=order
                    )
                    total_takeaways += 1
                self.stdout.write(f"  ✓ Added {len(takeaways)} takeaways to: {topic.title}")
            
            # Add exercises if missing
            if not Exercise.objects.filter(topic=topic).exists():
                exercises = self._get_exercises_for_topic(topic.title)
                for order, exercise in enumerate(exercises, start=1):
                    Exercise.objects.create(
                        topic=topic,
                        title=exercise['title'],
                        description=exercise['description'],
                        order=order
                    )
                    total_exercises += 1
                if exercises:
                    self.stdout.write(f"  ✓ Added {len(exercises)} exercises to: {topic.title}")
            
            # Add resources if missing
            if not Resource.objects.filter(topic=topic).exists():
                resources = self._get_resources_for_topic(topic.title)
                for order, resource in enumerate(resources, start=1):
                    Resource.objects.create(
                        topic=topic,
                        title=resource['title'],
                        description=resource['description'],
                        url=resource['url'],
                        order=order
                    )
                    total_resources += 1
                if resources:
                    self.stdout.write(f"  ✓ Added {len(resources)} resources to: {topic.title}")

        self.stdout.write(self.style.SUCCESS(f"\n✨ Population Complete!"))
        self.stdout.write(f"  Key Takeaways added: {total_takeaways}")
        self.stdout.write(f"  Exercises added: {total_exercises}")
        self.stdout.write(f"  Resources added: {total_resources}")

    def _get_takeaways_for_lesson(self, lesson_title):
        """Generate contextual key takeaways based on lesson title"""
        return [
            f"Master the core concepts of {lesson_title}",
            f"Understand how {lesson_title} applies to real-world scenarios",
            f"Be able to explain {lesson_title} in simple terms",
            f"Identify key principles and best practices in {lesson_title}"
        ]

    def _get_exercises_for_lesson(self, lesson_title):
        """Generate contextual exercises based on lesson title"""
        return [
            {
                'title': f'Practice Exercise: {lesson_title}',
                'description': f'Complete hands-on exercises to reinforce your understanding of {lesson_title}'
            },
            {
                'title': f'Case Study Analysis',
                'description': f'Analyze a real-world case study and apply concepts from {lesson_title}'
            },
            {
                'title': f'Knowledge Check',
                'description': f'Take a quiz to verify your understanding of {lesson_title}'
            }
        ]

    def _get_resources_for_lesson(self, lesson_title):
        """Generate contextual resources based on lesson title"""
        return [
            {
                'title': f'{lesson_title} Guide',
                'description': 'Comprehensive guide covering all aspects',
                'url': 'https://example.com/guide'
            },
            {
                'title': f'Video Tutorial: {lesson_title}',
                'description': 'Video explanation and walkthrough',
                'url': 'https://example.com/video'
            },
            {
                'title': f'{lesson_title} Cheat Sheet',
                'description': 'Quick reference guide and tips',
                'url': 'https://example.com/cheatsheet'
            }
        ]

    def _get_takeaways_for_topic(self, topic_title):
        """Generate contextual key takeaways based on topic title"""
        return [
            f"Understand the fundamentals of {topic_title}",
            f"Learn practical applications of {topic_title}",
            f"Develop skills in {topic_title}",
            f"Be able to critically analyze {topic_title}"
        ]

    def _get_exercises_for_topic(self, topic_title):
        """Generate contextual exercises based on topic title"""
        return [
            {
                'title': f'Exercise: {topic_title} Basics',
                'description': f'Fundamental exercises on {topic_title}'
            },
            {
                'title': f'Advanced {topic_title} Problem',
                'description': f'Challenge yourself with advanced problems in {topic_title}'
            }
        ]

    def _get_resources_for_topic(self, topic_title):
        """Generate contextual resources based on topic title"""
        return [
            {
                'title': f'{topic_title} Documentation',
                'description': 'Official documentation and reference',
                'url': 'https://example.com/docs'
            },
            {
                'title': f'Expert Guide to {topic_title}',
                'description': 'Insights from industry experts',
                'url': 'https://example.com/expert-guide'
            }
        ]

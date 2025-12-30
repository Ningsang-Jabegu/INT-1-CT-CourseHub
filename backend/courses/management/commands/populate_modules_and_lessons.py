from django.core.management.base import BaseCommand
from courses.models import Course, Module, Lesson, Topic, KeyTakeaway, Exercise, Resource
import uuid

class Command(BaseCommand):
    help = "Populate modules, lessons, and key takeaways for all existing courses"

    def handle(self, *args, **options):
        courses = Course.objects.all()
        total_modules = 0
        total_lessons = 0
        total_takeaways = 0
        total_exercises = 0
        total_resources = 0

        for course in courses:
            self.stdout.write(self.style.NOTICE(f"\n📚 Processing course: {course.title}"))
            
            # Check if course already has modules
            existing_modules = Module.objects.filter(course=course).count()
            
            if existing_modules > 0:
                self.stdout.write(self.style.WARNING(f"  • Course already has {existing_modules} module(s). Skipping..."))
                continue

            # Generate modules based on course title
            modules_data = self._get_modules_for_course(course.title)
            
            for mod_order, module_data in enumerate(modules_data, start=1):
                module, mod_created = Module.objects.get_or_create(
                    course=course,
                    title=module_data['title'],
                    defaults={
                        'description': module_data.get('description', ''),
                        'order': mod_order
                    }
                )
                
                if mod_created:
                    total_modules += 1
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Created module: {module.title}"))
                
                # Add lessons
                for les_order, lesson_data in enumerate(module_data.get('lessons', []), start=1):
                    lesson, les_created = Lesson.objects.get_or_create(
                        module=module,
                        title=lesson_data['title'],
                        defaults={
                            'content': lesson_data.get('content', ''),
                            'order': les_order
                        }
                    )
                    
                    if les_created:
                        total_lessons += 1
                        self.stdout.write(f"    • Created lesson: {lesson.title}")
                    
                    # Add key takeaways if lesson doesn't have any
                    if not KeyTakeaway.objects.filter(lesson=lesson).exists():
                        takeaways = lesson_data.get('takeaways', [])
                        for take_order, takeaway in enumerate(takeaways, start=1):
                            KeyTakeaway.objects.create(
                                lesson=lesson,
                                content=takeaway,
                                order=take_order
                            )
                            total_takeaways += 1
                        self.stdout.write(f"      ✓ Added {len(takeaways)} key takeaways")
                    
                    # Add exercises if lesson doesn't have any
                    if not Exercise.objects.filter(lesson=lesson).exists():
                        exercises = lesson_data.get('exercises', [])
                        for ex_order, exercise in enumerate(exercises, start=1):
                            Exercise.objects.create(
                                lesson=lesson,
                                title=exercise.get('title', ''),
                                description=exercise.get('description', ''),
                                order=ex_order
                            )
                            total_exercises += 1
                        if exercises:
                            self.stdout.write(f"      ✓ Added {len(exercises)} exercises")
                    
                    # Add resources if lesson doesn't have any
                    if not Resource.objects.filter(lesson=lesson).exists():
                        resources = lesson_data.get('resources', [])
                        for res_order, resource in enumerate(resources, start=1):
                            Resource.objects.create(
                                lesson=lesson,
                                title=resource.get('title', ''),
                                description=resource.get('description', ''),
                                url=resource.get('url', '#'),
                                order=res_order
                            )
                            total_resources += 1
                        if resources:
                            self.stdout.write(f"      ✓ Added {len(resources)} resources")

        self.stdout.write(self.style.SUCCESS(f"\n✨ Population Complete!"))
        self.stdout.write(f"  Modules created: {total_modules}")
        self.stdout.write(f"  Lessons created: {total_lessons}")
        self.stdout.write(f"  Key Takeaways created: {total_takeaways}")
        self.stdout.write(f"  Exercises created: {total_exercises}")
        self.stdout.write(f"  Resources created: {total_resources}")

    def _get_modules_for_course(self, course_title):
        """Generate relevant modules and lessons based on course title"""
        
        # Default comprehensive structure
        return [
            {
                'title': 'Introduction & Fundamentals',
                'description': 'Get started with the basics of this course',
                'lessons': [
                    {
                        'title': 'Course Overview',
                        'content': 'Welcome to the course! In this lesson, we will explore the foundational concepts and learning objectives.',
                        'takeaways': [
                            'Understand the scope and goals of this course',
                            'Identify key topics covered in each module',
                            'Set personal learning objectives'
                        ],
                        'exercises': [
                            {
                                'title': 'Reflection Exercise',
                                'description': 'Write down 3 goals you want to achieve by completing this course'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Course Syllabus',
                                'description': 'Complete course outline and schedule',
                                'url': 'https://example.com/syllabus'
                            }
                        ]
                    },
                    {
                        'title': 'Core Concepts',
                        'content': 'In this lesson, we will dive into the fundamental concepts that form the foundation of this course.',
                        'takeaways': [
                            'Master the essential terminology',
                            'Understand how core concepts relate to real-world applications',
                            'Be able to explain key ideas in simple terms'
                        ],
                        'exercises': [
                            {
                                'title': 'Vocabulary Quiz',
                                'description': 'Test your understanding of key terms and concepts'
                            },
                            {
                                'title': 'Concept Mapping',
                                'description': 'Create a visual map showing relationships between core concepts'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Glossary',
                                'description': 'Complete glossary of terms used in this course',
                                'url': 'https://example.com/glossary'
                            },
                            {
                                'title': 'Video Tutorial',
                                'description': 'Foundational concepts explained in video format',
                                'url': 'https://example.com/videos/basics'
                            }
                        ]
                    }
                ]
            },
            {
                'title': 'Core Content',
                'description': 'Main topics and in-depth learning materials',
                'lessons': [
                    {
                        'title': 'Deep Dive into Theory',
                        'content': 'Explore the theoretical foundations and research behind the main topics covered in this course.',
                        'takeaways': [
                            'Understand the theoretical basis of the subject',
                            'Learn from leading research and experts',
                            'Apply theory to practical scenarios'
                        ],
                        'exercises': [
                            {
                                'title': 'Case Study Analysis',
                                'description': 'Analyze a real-world case study and apply theoretical concepts'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Research Papers',
                                'description': 'Peer-reviewed research on the subject matter',
                                'url': 'https://example.com/research'
                            }
                        ]
                    },
                    {
                        'title': 'Practical Applications',
                        'content': 'Learn how to apply the concepts you\'ve learned to real-world situations and problems.',
                        'takeaways': [
                            'Identify where concepts apply in practice',
                            'Develop practical problem-solving skills',
                            'Learn industry best practices'
                        ],
                        'exercises': [
                            {
                                'title': 'Project Work',
                                'description': 'Complete a hands-on project applying course concepts'
                            },
                            {
                                'title': 'Problem Solving',
                                'description': 'Solve real-world problems using the techniques learned'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Code Samples',
                                'description': 'Working examples and code snippets',
                                'url': 'https://example.com/samples'
                            },
                            {
                                'title': 'Templates & Tools',
                                'description': 'Downloadable templates and useful tools',
                                'url': 'https://example.com/tools'
                            }
                        ]
                    }
                ]
            },
            {
                'title': 'Advanced Topics',
                'description': 'Explore advanced concepts and specialized knowledge',
                'lessons': [
                    {
                        'title': 'Advanced Concepts',
                        'content': 'Move beyond the basics and explore more complex topics and advanced methodologies.',
                        'takeaways': [
                            'Master advanced techniques and methods',
                            'Understand nuanced aspects of the subject',
                            'Prepare for expert-level applications'
                        ],
                        'exercises': [
                            {
                                'title': 'Advanced Problem Set',
                                'description': 'Challenge yourself with complex problems requiring advanced knowledge'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Advanced Documentation',
                                'description': 'In-depth technical documentation',
                                'url': 'https://example.com/docs/advanced'
                            }
                        ]
                    },
                    {
                        'title': 'Specializations & Trends',
                        'content': 'Explore emerging trends, specializations, and future directions in this field.',
                        'takeaways': [
                            'Stay updated with industry trends',
                            'Explore different specialization paths',
                            'Understand future opportunities'
                        ],
                        'exercises': [
                            {
                                'title': 'Trend Analysis',
                                'description': 'Research and present on emerging trends in the field'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Industry Reports',
                                'description': 'Latest market research and trend reports',
                                'url': 'https://example.com/reports'
                            },
                            {
                                'title': 'Expert Articles',
                                'description': 'Articles by industry experts and thought leaders',
                                'url': 'https://example.com/articles'
                            }
                        ]
                    }
                ]
            },
            {
                'title': 'Practical Project & Assessment',
                'description': 'Capstone project and comprehensive assessment',
                'lessons': [
                    {
                        'title': 'Capstone Project',
                        'content': 'Apply everything you\'ve learned in a comprehensive project that demonstrates mastery of the course material.',
                        'takeaways': [
                            'Synthesize knowledge from all modules',
                            'Demonstrate practical competency',
                            'Create a portfolio piece'
                        ],
                        'exercises': [
                            {
                                'title': 'Complete Capstone Project',
                                'description': 'Design and implement a comprehensive project showcasing your learning'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Project Guidelines',
                                'description': 'Detailed guidelines and rubric for the capstone project',
                                'url': 'https://example.com/project-guidelines'
                            }
                        ]
                    },
                    {
                        'title': 'Course Review & Reflection',
                        'content': 'Review what you\'ve learned, assess your growth, and plan next steps in your learning journey.',
                        'takeaways': [
                            'Reflect on learning progress',
                            'Identify areas for continued growth',
                            'Plan next learning steps'
                        ],
                        'exercises': [
                            {
                                'title': 'Comprehensive Assessment',
                                'description': 'Take a comprehensive exam covering all course material'
                            },
                            {
                                'title': 'Learning Reflection',
                                'description': 'Write a reflection on your learning journey and insights gained'
                            }
                        ],
                        'resources': [
                            {
                                'title': 'Next Steps Guide',
                                'description': 'Resources for continuing your learning journey',
                                'url': 'https://example.com/next-steps'
                            }
                        ]
                    }
                ]
            }
        ]

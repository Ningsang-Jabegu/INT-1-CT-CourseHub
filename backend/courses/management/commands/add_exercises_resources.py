from django.core.management.base import BaseCommand
from courses.models import Course, Exercise, Resource


class Command(BaseCommand):
    help = "Add sample exercises and resources to AI course lessons and topics"

    def handle(self, *args, **options):
        try:
            ai_course = Course.objects.get(title="Artificial Intelligence")
        except Course.DoesNotExist:
            self.stdout.write(self.style.ERROR("AI course not found"))
            return

        # Sample exercise and resource data for lessons
        lesson_exercises = {
            "Introduction to AI": "Try completing the AI Applications Quiz test",
            "Machine Learning Fundamentals": "Analyze a sample dataset with ML techniques",
            "Deep Learning & Neural Networks": "Build your first neural network using TensorFlow",
            "Natural Language Processing": "Create a simple text classification project",
            "Computer Vision": "Work on image recognition and classification tasks",
            "Reinforcement Learning": "Develop a game-playing agent using Q-learning",
            "AI Ethics & Safety": "Analyze an AI system for ethical implications",
            "Future of AI": "Review a cutting-edge AI research paper"
        }

        lesson_resources = {
            "Introduction to AI": [
                ("IBM AI Learning", "https://www.ibm.com/cloud/learn/what-is-artificial-intelligence"),
                ("AI Industry Report", "https://www.statista.com/outlook/tmo/artificial-intelligence")
            ],
            "Machine Learning Fundamentals": [
                ("Scikit-learn Docs", "https://scikit-learn.org/"),
                ("Andrew Ng ML Course", "https://www.coursera.org/learn/machine-learning")
            ],
            "Deep Learning & Neural Networks": [
                ("TensorFlow Guide", "https://www.tensorflow.org/"),
                ("PyTorch Tutorials", "https://pytorch.org/tutorials/")
            ],
            "Natural Language Processing": [
                ("Hugging Face Transformers", "https://huggingface.co/transformers/"),
                ("NLTK Documentation", "https://www.nltk.org/")
            ],
            "Computer Vision": [
                ("OpenCV Documentation", "https://opencv.org/"),
                ("Stanford CS231n", "http://cs231n.stanford.edu/")
            ],
            "Reinforcement Learning": [
                ("OpenAI Gym", "https://www.gymlibrary.dev/"),
                ("Deep RL Hands-On", "https://github.com/PacktPublishing/Deep-Reinforcement-Learning-Hands-On")
            ],
            "AI Ethics & Safety": [
                ("Partnership on AI", "https://www.partnershiponai.org/"),
                ("UNESCO AI Ethics", "https://en.unesco.org/artificial-intelligence/ethics")
            ],
            "Future of AI": [
                ("OpenAI Research", "https://openai.com/research"),
                ("DeepMind Blog", "https://deepmind.com/blog")
            ]
        }

        # Add exercises and resources to lessons
        for module in ai_course.modules.all():
            for lesson in module.lessons.all():
                # Add exercise if exists
                if lesson.title in lesson_exercises:
                    Exercise.objects.get_or_create(
                        lesson=lesson,
                        title="Practice Exercise",
                        defaults={
                            "description": f"<p>{lesson_exercises[lesson.title]}</p>",
                            "order": 1
                        }
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Added exercise to lesson: {lesson.title}")
                    )

                # Add resources if exist
                if lesson.title in lesson_resources:
                    for idx, (res_title, res_url) in enumerate(lesson_resources[lesson.title], 1):
                        Resource.objects.get_or_create(
                            lesson=lesson,
                            title=res_title,
                            defaults={
                                "description": "Useful reference material",
                                "url": res_url,
                                "order": idx
                            }
                        )
                        self.stdout.write(
                            self.style.SUCCESS(f"✓ Added resource '{res_title}' to lesson: {lesson.title}")
                        )

                # Add exercises and resources to topics
                for topic in lesson.topics.all():
                    topic_title = topic.title.lower()

                    # Add topic exercise based on keywords
                    if "network" in topic_title or "neural" in topic_title:
                        Exercise.objects.get_or_create(
                            topic=topic,
                            title="Implement Network Layer",
                            defaults={
                                "description": "<p>Code a neural network layer with forward and backward pass.</p>",
                                "order": 1
                            }
                        )
                    elif "loss" in topic_title or "gradient" in topic_title:
                        Exercise.objects.get_or_create(
                            topic=topic,
                            title="Implement Optimization",
                            defaults={
                                "description": "<p>Code gradient descent optimization algorithm.</p>",
                                "order": 1
                            }
                        )
                    elif "embedding" in topic_title or "vector" in topic_title:
                        Exercise.objects.get_or_create(
                            topic=topic,
                            title="Create Text Embeddings",
                            defaults={
                                "description": "<p>Generate word embeddings and analyze vector relationships.</p>",
                                "order": 1
                            }
                        )

                    # Add topic resource based on keywords
                    if "algorithm" in topic_title:
                        Resource.objects.get_or_create(
                            topic=topic,
                            title="Algorithm Visualizer",
                            defaults={
                                "description": "Interactive algorithm visualization",
                                "url": "https://www.cs.usfca.edu/~galles/visualization/",
                                "order": 1
                            }
                        )
                    elif "gradient" in topic_title:
                        Resource.objects.get_or_create(
                            topic=topic,
                            title="Gradient Descent Guide",
                            defaults={
                                "description": "Visual guide to gradient descent",
                                "url": "https://blog.paperspace.com/gradient-descent/",
                                "order": 1
                            }
                        )

        self.stdout.write(
            self.style.SUCCESS("\n✓ Successfully added all exercises and resources to AI course!")
        )

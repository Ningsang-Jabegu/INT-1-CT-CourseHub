from django.core.management.base import BaseCommand
from courses.models import Lesson, KeyTakeaway


class Command(BaseCommand):
    help = "Add key takeaways to all AI course lessons"

    def handle(self, *args, **options):
        # AI course lessons to update
        lesson_takeaways = {
            "What is Artificial Intelligence?": [
                "<strong>AI</strong> is the simulation of human intelligence by computer systems",
                "AI systems can <em>learn from data</em>, <em>recognize patterns</em>, and <em>make predictions</em>",
                "AI is transforming industries like healthcare, finance, transportation, and entertainment",
                "Understanding AI fundamentals is essential for building modern intelligent systems"
            ],
            "History and Evolution of AI": [
                "AI was born in <strong>1956</strong> at the Dartmouth Conference",
                "AI has experienced periods of hype and disillusionment called <em>AI Winters</em>",
                "Major breakthroughs: Deep Blue (1997), Watson (2011), AlphaGo (2016)",
                "We're currently in the era of <strong>deep learning</strong> and <strong>large language models</strong>"
            ],
            "Introduction to Machine Learning": [
                "ML enables systems to <strong>learn from data</strong> without explicit programming",
                "Three key inputs: <em>Data</em>, <em>Goals</em>, and <em>Feedback</em>",
                "Avoid <strong>overfitting</strong> - models should learn patterns, not memorize",
                "Features and proper data preparation are crucial for ML success"
            ],
            "Types of Machine Learning": [
                "<strong>Supervised Learning:</strong> Uses labeled data for classification and regression",
                "<strong>Unsupervised Learning:</strong> Discovers patterns in unlabeled data",
                "<strong>Reinforcement Learning:</strong> Learns through rewards and interactions",
                "Modern AI often combines <em>multiple learning types</em> for best results"
            ],
            "Neural Networks Basics": [
                "Neural networks have <strong>input</strong>, <strong>hidden</strong>, and <strong>output layers</strong>",
                "<em>Weights</em> control connection strength; <em>Biases</em> shift activations",
                "Activation functions add <strong>non-linearity</strong> for complex learning",
                "<strong>Backpropagation</strong> trains networks by minimizing error"
            ],
            "Deep Learning Architectures": [
                "<strong>CNNs</strong> excel at image processing and computer vision",
                "<strong>RNNs and LSTM</strong> handle sequential data like text and time-series",
                "<strong>Transformers</strong> process sequences in parallel with attention mechanisms",
                "Choose architecture based on your <em>data type and problem domain</em>"
            ],
            "Fundamentals of NLP": [
                "NLP helps computers <strong>understand</strong> and <strong>generate</strong> human language",
                "Context and ambiguity are major challenges in language processing",
                "Core tasks: <em>text processing</em>, <em>understanding</em>, and <em>generation</em>",
                "Transformers and deep learning enable state-of-the-art NLP performance"
            ],
            "Advanced NLP Techniques": [
                "<strong>Word embeddings</strong> convert words to semantic vectors",
                "<strong>BERT</strong> and <strong>GPT</strong> are revolutionary pre-trained models",
                "Large Language Models (LLMs) perform many tasks with minimal fine-tuning",
                "From task-specific to <em>general-purpose AI</em> - a paradigm shift"
            ],
            "Image Processing Fundamentals": [
                "Images are <strong>numerical arrays</strong> where pixels have intensity values",
                "Basic operations: <em>filtering</em>, <em>transformations</em>, <em>feature extraction</em>",
                "<strong>Features</strong> are distinctive patterns that help identify objects",
                "Modern CV uses deep learning to automatically learn visual features"
            ],
            "Deep Learning for Vision": [
                "Classic architectures: <strong>LeNet</strong>, <strong>AlexNet</strong>, <strong>VGG</strong>, <strong>ResNet</strong>",
                "<strong>ResNet</strong> introduced <em>residual connections</em> enabling very deep networks",
                "Vision tasks: classification, detection, segmentation, pose estimation",
                "<strong>Transfer learning</strong> allows reusing pre-trained models for new tasks"
            ],
            "Introduction to Reinforcement Learning": [
                "RL: Agent learns through <em>interaction</em> and <em>rewards</em>",
                "Key components: <strong>Agent</strong>, <strong>Environment</strong>, <strong>Actions</strong>, <strong>Rewards</strong>",
                "Goal: Maximize <em>cumulative reward</em> over time",
                "Learn optimal <strong>policies</strong> for decision-making"
            ],
            "Deep Reinforcement Learning": [
                "<strong>Q-Learning</strong> learns value of actions in each state",
                "<strong>Policy Gradient</strong> methods directly optimize action probabilities",
                "<strong>PPO and A3C</strong> are state-of-the-art algorithms",
                "Applications: Game AI, robotics, autonomous vehicles, trading"
            ],
            "AI in Business and Industry": [
                "<strong>Healthcare:</strong> Diagnostic imaging, drug discovery, personalized medicine",
                "<strong>Finance:</strong> Fraud detection, algorithmic trading, risk management",
                "<strong>E-commerce:</strong> Recommendations, demand forecasting, inventory management",
                "<strong>Manufacturing:</strong> Predictive maintenance, quality control, supply chain"
            ],
            "Emerging AI Frontiers": [
                "<strong>Autonomous Vehicles</strong> use perception, planning, and control",
                "<strong>Robotics</strong> advances: industrial, humanoid, swarm, soft robots",
                "<strong>Generative AI:</strong> Text, images, code, and audio generation",
                "<strong>Extended Reality:</strong> AR, VR, MR merging digital and physical worlds"
            ],
            "Ethics and Responsible AI": [
                "<strong>Bias and Fairness:</strong> AI can perpetuate societal biases",
                "<strong>Transparency:</strong> Users deserve to understand AI decisions",
                "<strong>Privacy:</strong> Protect individual data in AI systems",
                "<strong>Accountability:</strong> Clear responsibility for AI outcomes"
            ],
            "The Future of AI": [
                "Near-term: Multimodal AI, efficient models, AI agents, improved reasoning",
                "Medium-term: General-purpose AI, scientific discovery, creative collaboration",
                "Challenges: Job displacement, misinformation, power concentration, environment",
                "Success requires collaboration between technologists, policymakers, ethicists"
            ]
        }

        updated_count = 0
        for lesson_title, takeaways in lesson_takeaways.items():
            try:
                lesson = Lesson.objects.get(title=lesson_title)
                # Delete existing takeaways
                lesson.takeaways.all().delete()
                # Add new takeaways
                for order, content in enumerate(takeaways, 1):
                    KeyTakeaway.objects.create(
                        lesson=lesson,
                        content=content,
                        order=order
                    )
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Updated '{lesson_title}' with {len(takeaways)} takeaways")
                )
                updated_count += 1
            except Lesson.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"⚠ Lesson '{lesson_title}' not found")
                )

        self.stdout.write(
            self.style.SUCCESS(f"\n✓ Successfully updated {updated_count} lessons with key takeaways")
        )

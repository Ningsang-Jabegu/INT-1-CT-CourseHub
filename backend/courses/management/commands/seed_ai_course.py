from django.core.management.base import BaseCommand
from courses.models import Course, Module, Lesson, Topic, KeyTakeaway


class Command(BaseCommand):
    help = "Seed the database with Artificial Intelligence course with richly formatted content"

    def handle(self, *args, **options):
        # Create or get the AI course
        course, created = Course.objects.get_or_create(
            title="Artificial Intelligence",
            defaults={
                "description": "A comprehensive guide to understanding Artificial Intelligence, machine learning, deep learning, and their real-world applications."
            }
        )
        
        if not created:
            # Clear existing modules and lessons
            course.modules.all().delete()
        
        self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Using existing'} course: {course.title}"))
        
        # Module 1: Introduction to AI
        module1 = Module.objects.create(
            course=course,
            title="Introduction to Artificial Intelligence",
            description="Fundamentals and overview of AI",
            order=1
        )
        
        lesson1_1 = Lesson.objects.create(
            module=module1,
            title="What is Artificial Intelligence?",
            order=1,
            content="""<h2>What is Artificial Intelligence?</h2><p><strong>Artificial Intelligence (AI)</strong> refers to the simulation of human intelligence processes by computer systems. These processes include learning, reasoning, problem-solving, perception, and language understanding.</p><h3>Key Characteristics of AI:</h3><ul><li>Ability to learn from data and experience</li><li>Capacity to recognize patterns</li><li>Power to make predictions and decisions</li><li>Capability to understand natural language</li><li>Potential to perceive and interpret visual information</li></ul><h3>Why AI Matters Today:</h3><p>Artificial Intelligence has become integral to modern technology. From <em>recommendation systems</em> that suggest what you watch on Netflix to <em>autonomous vehicles</em> that navigate roads, AI is transforming industries and improving lives.</p><blockquote><p>"The question of whether machines can think is about as relevant as the question of whether submarines can swim." - Edsger Dijkstra</p></blockquote><p>This course will guide you through the foundations and advanced concepts of AI, preparing you to build intelligent systems.</p>"""
        )
        
        # Add key takeaways for lesson 1.1
        KeyTakeaway.objects.create(lesson=lesson1_1, content="<strong>AI</strong> is the simulation of human intelligence by computer systems", order=1)
        KeyTakeaway.objects.create(lesson=lesson1_1, content="AI systems can <em>learn from data</em>, <em>recognize patterns</em>, and <em>make predictions</em>", order=2)
        KeyTakeaway.objects.create(lesson=lesson1_1, content="AI is transforming industries like healthcare, finance, transportation, and entertainment", order=3)
        KeyTakeaway.objects.create(lesson=lesson1_1, content="Understanding AI fundamentals is essential for building modern intelligent systems", order=4)
        
        lesson1_2 = Lesson.objects.create(
            module=module1,
            title="History and Evolution of AI",
            order=2,
            content="""<h2>History and Evolution of Artificial Intelligence</h2><p>The journey of AI spans over seven decades, filled with groundbreaking discoveries and paradigm shifts.</p><h3>Timeline of AI Development:</h3><h4>1950s: The Birth of AI</h4><ul><li><strong>1950:</strong> Alan Turing publishes "Computing Machinery and Intelligence"</li><li><strong>1956:</strong> Dartmouth Conference marks the official birth of AI as a field</li><li>Pioneers included John McCarthy, Marvin Minsky, and Claude Shannon</li></ul><h4>1960s-1970s: The Golden Age</h4><ul><li>Rapid progress in problem-solving and symbolic reasoning</li><li>Development of early expert systems</li><li>Optimism about achieving human-level intelligence soon</li></ul><h4>1974-1980: First AI Winter</h4><ul><li>Unmet expectations led to reduced funding and interest</li><li>Computational limitations became apparent</li><li>Over-promising of AI capabilities</li></ul><h4>1980s: The Revival</h4><ul><li>Expert systems boom in commercial applications</li><li>Renewed investment in AI research</li><li>Development of LISP machines</li></ul><h4>1987-1993: Second AI Winter</h4><p>Another period of reduced enthusiasm and funding due to limitations of expert systems.</p><h4>1997 Onwards: The Modern Era</h4><ul><li><strong>1997:</strong> IBM's Deep Blue defeats Garry Kasparov in chess</li><li><strong>2011:</strong> IBM's Watson wins Jeopardy!</li><li><strong>2016:</strong> AlphaGo defeats Lee Sedol in Go</li><li><strong>2020s:</strong> Explosion of deep learning and large language models</li></ul><p>Today, we're in an era of unprecedented AI advancement, with applications across virtually every industry.</p>"""
        )
        
        # Add key takeaways for lesson 1.2
        KeyTakeaway.objects.create(lesson=lesson1_2, content="AI was born in <strong>1956</strong> at the Dartmouth Conference", order=1)
        KeyTakeaway.objects.create(lesson=lesson1_2, content="AI has experienced periods of hype and disillusionment called <em>AI Winters</em>", order=2)
        KeyTakeaway.objects.create(lesson=lesson1_2, content="Major breakthroughs: Deep Blue (1997), Watson (2011), AlphaGo (2016)", order=3)
        KeyTakeaway.objects.create(lesson=lesson1_2, content="We're currently in the era of <strong>deep learning</strong> and <strong>large language models</strong>", order=4)
        
        # Module 2: Machine Learning Basics
        module2 = Module.objects.create(
            course=course,
            title="Machine Learning Fundamentals",
            description="Core concepts and types of machine learning",
            order=2
        )
        
        lesson2_1 = Lesson.objects.create(
            module=module2,
            title="Introduction to Machine Learning",
            order=1,
            content="""<h2>Introduction to Machine Learning</h2><p><strong>Machine Learning</strong> is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed for every scenario.</p><h3>How Machine Learning Works:</h3><p>Instead of writing explicit rules, we provide algorithms with:</p><ol><li><strong>Data:</strong> Examples and patterns</li><li><strong>Goals:</strong> What we want the system to predict or classify</li><li><strong>Feedback:</strong> Information about prediction accuracy</li></ol><p>The algorithm then <em>learns</em> patterns from the data and creates a model that can make predictions on new, unseen data.</p><h3>Core Machine Learning Concepts:</h3><ul><li><strong>Features:</strong> Input variables that describe the data</li><li><strong>Training Data:</strong> Data used to teach the model</li><li><strong>Model:</strong> The learned pattern or function</li><li><strong>Testing Data:</strong> Data used to evaluate model performance</li><li><strong>Overfitting:</strong> When a model memorizes data instead of learning patterns</li></ul><p>Machine Learning is the foundation of modern AI applications and will be the focus of the next several modules.</p>"""
        )
        
        KeyTakeaway.objects.create(lesson=lesson2_1, content="ML enables systems to <strong>learn from data</strong> without explicit programming", order=1)
        KeyTakeaway.objects.create(lesson=lesson2_1, content="Three key inputs: <em>Data</em>, <em>Goals</em>, and <em>Feedback</em>", order=2)
        KeyTakeaway.objects.create(lesson=lesson2_1, content="Avoid <strong>overfitting</strong> - models should learn patterns, not memorize", order=3)
        KeyTakeaway.objects.create(lesson=lesson2_1, content="Features and proper data preparation are crucial for ML success", order=4)
        
        lesson2_2 = Lesson.objects.create(
            module=module2,
            title="Types of Machine Learning",
            order=2,
            content="""<h2>Types of Machine Learning</h2><p>Machine Learning can be categorized into three main types based on the nature of learning:</p><h3>1. Supervised Learning</h3><p>In <strong>supervised learning</strong>, we provide labeled examples where both inputs and desired outputs are known.</p><ul><li><strong>Classification:</strong> Predicting categories (e.g., spam vs. not spam)</li><li><strong>Regression:</strong> Predicting continuous values (e.g., house prices)</li><li><em>Examples:</em> Email filtering, credit scoring, weather forecasting</li></ul><h3>2. Unsupervised Learning</h3><p><strong>Unsupervised learning</strong> works with unlabeled data, finding hidden patterns and structures.</p><ul><li><strong>Clustering:</strong> Grouping similar data points (e.g., customer segmentation)</li><li><strong>Dimensionality Reduction:</strong> Simplifying data while preserving information</li><li><em>Examples:</em> Customer segmentation, data compression, anomaly detection</li></ul><h3>3. Reinforcement Learning</h3><p><strong>Reinforcement learning</strong> involves an agent learning through interaction with an environment, receiving rewards or penalties.</p><ul><li>The agent learns optimal strategies through trial and error</li><li><em>Examples:</em> Game-playing AI, robotics, autonomous vehicles</li></ul><blockquote><p>Each learning type has unique applications, and modern AI systems often combine multiple types for comprehensive intelligence.</p></blockquote>"""
        )
        
        KeyTakeaway.objects.create(lesson=lesson2_2, content="<strong>Supervised Learning:</strong> Uses labeled data for classification and regression", order=1)
        KeyTakeaway.objects.create(lesson=lesson2_2, content="<strong>Unsupervised Learning:</strong> Discovers patterns in unlabeled data", order=2)
        KeyTakeaway.objects.create(lesson=lesson2_2, content="<strong>Reinforcement Learning:</strong> Learns through rewards and interactions", order=3)
        KeyTakeaway.objects.create(lesson=lesson2_2, content="Modern AI often combines <em>multiple learning types</em> for best results", order=4)
        
        # Module 3: Deep Learning
        module3 = Module.objects.create(
            course=course,
            title="Deep Learning and Neural Networks",
            description="Understanding neural networks and deep learning architectures",
            order=3
        )
        
        lesson3_1 = Lesson.objects.create(
            module=module3,
            title="Neural Networks Basics",
            order=1,
            content="""<h2>Neural Networks Basics</h2><p><strong>Neural Networks</strong> are computing systems inspired by biological neural networks in animal brains. They form the backbone of modern deep learning.</p><h3>Structure of a Neural Network:</h3><p>A neural network consists of interconnected layers:</p><ul><li><strong>Input Layer:</strong> Receives the input features</li><li><strong>Hidden Layers:</strong> Process information through weighted connections</li><li><strong>Output Layer:</strong> Produces the final prediction</li></ul><h3>Key Components:</h3><h4>Neurons</h4><p>Each neuron receives inputs, applies a mathematical function (activation function), and produces an output.</p><h4>Weights and Biases</h4><ul><li><strong>Weights:</strong> Control the strength of connections between neurons</li><li><strong>Biases:</strong> Shift the activation function to better fit the data</li></ul><h4>Activation Functions</h4><p>Activation functions introduce non-linearity, enabling networks to learn complex patterns:</p><ul><li><strong>ReLU:</strong> Popular in hidden layers (f(x) = max(0, x))</li><li><strong>Sigmoid:</strong> Used in binary classification</li><li><strong>Tanh:</strong> Similar to sigmoid but centered at zero</li><li><strong>Softmax:</strong> Used for multi-class classification</li></ul><p>Neural networks are trained by adjusting weights and biases to minimize error on training data, a process called <em>backpropagation</em>.</p>"""
        )
        
        KeyTakeaway.objects.create(lesson=lesson3_1, content="Neural networks have <strong>input</strong>, <strong>hidden</strong>, and <strong>output layers</strong>", order=1)
        KeyTakeaway.objects.create(lesson=lesson3_1, content="<em>Weights</em> control connection strength; <em>Biases</em> shift activations", order=2)
        KeyTakeaway.objects.create(lesson=lesson3_1, content="Activation functions add <strong>non-linearity</strong> for complex learning", order=3)
        KeyTakeaway.objects.create(lesson=lesson3_1, content="<strong>Backpropagation</strong> trains networks by minimizing error", order=4)
        
        lesson3_2 = Lesson.objects.create(
            module=module3,
            title="Deep Learning Architectures",
            order=2,
            content="""<h2>Deep Learning Architectures</h2><p><strong>Deep Learning</strong> refers to neural networks with multiple hidden layers. Different architectures are designed for different types of problems.</p><h3>Convolutional Neural Networks (CNN)</h3><p>Designed for image processing and computer vision tasks:</p><ul><li>Convolutional layers detect local patterns (edges, textures)</li><li>Pooling layers reduce spatial dimensions</li><li>Fully connected layers make final predictions</li><li><em>Applications:</em> Image classification, object detection, facial recognition</li></ul><h3>Recurrent Neural Networks (RNN)</h3><p>Designed for sequential data like text and time-series:</p><ul><li>Maintain hidden state to process sequences</li><li>Can handle variable-length inputs</li><li><em>Variants:</em> LSTM, GRU for better long-term memory</li><li><em>Applications:</em> Language modeling, machine translation, stock prediction</li></ul><h3>Transformer Networks</h3><p>Modern architecture based on attention mechanisms:</p><ul><li>Process entire sequences in parallel (unlike RNNs)</li><li>Can capture long-range dependencies efficiently</li><li>Foundation for large language models (GPT, BERT)</li><li><em>Applications:</em> NLP, machine translation, text generation</li></ul><blockquote><p>The choice of architecture depends on your data type and problem requirements.</p></blockquote>"""
        )
        
        KeyTakeaway.objects.create(lesson=lesson3_2, content="<strong>CNNs</strong> excel at image processing and computer vision", order=1)
        KeyTakeaway.objects.create(lesson=lesson3_2, content="<strong>RNNs and LSTM</strong> handle sequential data like text and time-series", order=2)
        KeyTakeaway.objects.create(lesson=lesson3_2, content="<strong>Transformers</strong> process sequences in parallel with attention mechanisms", order=3)
        KeyTakeaway.objects.create(lesson=lesson3_2, content="Choose architecture based on your <em>data type and problem domain</em>", order=4)
        
        # Module 4: Natural Language Processing
        module4 = Module.objects.create(
            course=course,
            title="Natural Language Processing",
            description="Teaching machines to understand human language",
            order=4
        )
        
        Lesson.objects.create(
            module=module4,
            title="Fundamentals of NLP",
            order=1,
            content="""<h2>Fundamentals of Natural Language Processing</h2><p><strong>Natural Language Processing (NLP)</strong> is the branch of AI that focuses on enabling computers to understand, interpret, and generate human language in a meaningful and useful way.</p><h3>Why NLP is Challenging:</h3><ul><li><strong>Ambiguity:</strong> Words and sentences can have multiple meanings</li><li><strong>Context:</strong> Meaning depends on surrounding words and context</li><li><strong>Variability:</strong> Same idea can be expressed in many ways</li><li><strong>Complexity:</strong> Grammar, idioms, and cultural nuances</li></ul><h3>Core NLP Tasks:</h3><h4>Text Processing</h4><ul><li><em>Tokenization:</em> Breaking text into words or phrases</li><li><em>Stemming/Lemmatization:</em> Reducing words to base forms</li><li><em>Part-of-speech tagging:</em> Identifying nouns, verbs, adjectives, etc.</li></ul><h4>Understanding Tasks</h4><ul><li><em>Sentiment Analysis:</em> Determining emotional tone</li><li><em>Named Entity Recognition:</em> Identifying people, places, organizations</li><li><em>Semantic Similarity:</em> Measuring meaning similarity between texts</li></ul><h4>Generation Tasks</h4><ul><li><em>Machine Translation:</em> Translating between languages</li><li><em>Text Summarization:</em> Creating concise summaries</li><li><em>Dialogue Systems:</em> Enabling chatbots to converse</li></ul><p>Modern NLP uses deep learning, particularly transformer models, for state-of-the-art performance.</p>"""
        )
        
        lesson4_1 = Lesson.objects.create(
            module=module4,
            title="Fundamentals of NLP",
            order=1,
            content="""<h2>Fundamentals of Natural Language Processing</h2><p><strong>Natural Language Processing (NLP)</strong> is the branch of AI that focuses on enabling computers to understand, interpret, and generate human language in a meaningful and useful way.</p><h3>Why NLP is Challenging:</h3><ul><li><strong>Ambiguity:</strong> Words and sentences can have multiple meanings</li><li><strong>Context:</strong> Meaning depends on surrounding words and context</li><li><strong>Variability:</strong> Same idea can be expressed in many ways</li><li><strong>Complexity:</strong> Grammar, idioms, and cultural nuances</li></ul><h3>Core NLP Tasks:</h3><h4>Text Processing</h4><ul><li><em>Tokenization:</em> Breaking text into words or phrases</li><li><em>Stemming/Lemmatization:</em> Reducing words to base forms</li><li><em>Part-of-speech tagging:</em> Identifying nouns, verbs, adjectives, etc.</li></ul><h4>Understanding Tasks</h4><ul><li><em>Sentiment Analysis:</em> Determining emotional tone</li><li><em>Named Entity Recognition:</em> Identifying people, places, organizations</li><li><em>Semantic Similarity:</em> Measuring meaning similarity between texts</li></ul><h4>Generation Tasks</h4><ul><li><em>Machine Translation:</em> Translating between languages</li><li><em>Text Summarization:</em> Creating concise summaries</li><li><em>Dialogue Systems:</em> Enabling chatbots to converse</li></ul><p>Modern NLP uses deep learning, particularly transformer models, for state-of-the-art performance.</p>"""
        )
        
        KeyTakeaway.objects.create(lesson=lesson4_1, content="NLP helps computers <strong>understand</strong> and <strong>generate</strong> human language", order=1)
        KeyTakeaway.objects.create(lesson=lesson4_1, content="Context and ambiguity are major challenges in language processing", order=2)
        KeyTakeaway.objects.create(lesson=lesson4_1, content="Core tasks: <em>text processing</em>, <em>understanding</em>, and <em>generation</em>", order=3)
        KeyTakeaway.objects.create(lesson=lesson4_1, content="Transformers and deep learning enable state-of-the-art NLP performance", order=4)
        
        lesson4_2 = Lesson.objects.create(
            module=module4,
            title="Advanced NLP Techniques",
            order=2,
            content="""<h2>Advanced NLP Techniques</h2><p>Modern NLP has been revolutionized by deep learning and pre-trained language models.</p><h3>Word Embeddings</h3><p>Converting words into numerical vectors that capture semantic meaning:</p><ul><li><strong>Word2Vec:</strong> Learns word relationships from large corpora</li><li><strong>GloVe:</strong> Combines local and global statistical information</li><li><strong>FastText:</strong> Handles out-of-vocabulary words using character n-grams</li></ul><p>These embeddings capture relationships like: <em>King - Man + Woman ≈ Queen</em></p><h3>Pre-trained Language Models</h3><p>Large models trained on massive text corpora that can be fine-tuned for specific tasks:</p><ul><li><strong>BERT:</strong> Bidirectional encoder for understanding context</li><li><strong>GPT:</strong> Generative pre-trained transformer for text generation</li><li><strong>T5:</strong> Treats all NLP tasks as text-to-text problems</li></ul><h3>Large Language Models (LLMs)</h3><p>Massive models with billions of parameters that can:</p><ul><li>Perform zero-shot learning on new tasks</li><li>Generate human-like text</li><li>Answer questions and provide explanations</li><li><em>Examples:</em> GPT-4, Claude, Bard</li></ul><blockquote><p>The shift from task-specific models to general-purpose LLMs represents a paradigm change in AI capabilities.</p></blockquote>"""
        )
        
        KeyTakeaway.objects.create(lesson=lesson4_2, content="<strong>Word embeddings</strong> convert words to semantic vectors", order=1)
        KeyTakeaway.objects.create(lesson=lesson4_2, content="<strong>BERT</strong> and <strong>GPT</strong> are revolutionary pre-trained models", order=2)
        KeyTakeaway.objects.create(lesson=lesson4_2, content="Large Language Models (LLMs) perform many tasks with minimal fine-tuning", order=3)
        KeyTakeaway.objects.create(lesson=lesson4_2, content="From task-specific to <em>general-purpose AI</em> - a paradigm shift", order=4)
        
        lesson4_2b = Lesson.objects.create(
        )
        
        # Module 5: Computer Vision
        module5 = Module.objects.create(
            course=course,
            title="Computer Vision",
            description="Enabling machines to see and understand images",
            order=5
        )
        
        Lesson.objects.create(
            module=module5,
            title="Image Processing Fundamentals",
            order=1,
            content="""<h2>Image Processing Fundamentals</h2><p><strong>Computer Vision</strong> is the field of AI that teaches machines to interpret and understand visual information from images and videos.</p><h3>How Computers See Images:</h3><p>Images are represented as numerical arrays (matrices) where each element represents pixel intensity or color:</p><ul><li><strong>Grayscale Images:</strong> 2D array with values 0-255 (black to white)</li><li><strong>Color Images:</strong> 3D array with RGB channels (Red, Green, Blue)</li></ul><h3>Basic Image Processing Operations:</h3><h4>Filtering</h4><ul><li><strong>Blur:</strong> Reduce noise and detail</li><li><strong>Sharpen:</strong> Enhance edges and details</li><li><strong>Edge Detection:</strong> Identify boundaries in images (Canny, Sobel)</li></ul><h4>Transformations</h4><ul><li><strong>Rotation:</strong> Change image orientation</li><li><strong>Scaling:</strong> Resize images</li><li><strong>Histogram Equalization:</strong> Improve contrast</li></ul><h3>Key Concepts:</h3><p><em>Features</em> are distinctive patterns or characteristics in images (corners, edges, textures) that help identify objects. Traditional CV relied on hand-crafted features, while modern deep learning learns features automatically.</p>"""
        )
        
        Lesson.objects.create(
            module=module5,
            title="Deep Learning for Vision",
            order=2,
            content="""<h2>Deep Learning for Computer Vision</h2><p>Convolutional Neural Networks (CNNs) have revolutionized computer vision by automatically learning visual features.</p><h3>Classic CNN Architectures:</h3><h4>LeNet (1998)</h4><ul><li>One of the first CNNs</li><li>Designed for handwritten digit recognition</li><li>Simple architecture but groundbreaking for its time</li></ul><h4>AlexNet (2012)</h4><ul><li>Won ImageNet competition with significant margin</li><li>Sparked the deep learning revolution</li><li>Deeper and more sophisticated than predecessors</li></ul><h4>VGG (2014)</h4><ul><li>Showed importance of network depth</li><li>Simple, regular architecture with small 3×3 filters</li><li>Widely used for transfer learning</li></ul><h4>ResNet (2015)</h4><ul><li>Introduced residual connections enabling very deep networks</li><li>Made training of 150+ layer networks practical</li><li>Achieved superhuman performance on image classification</li></ul><h3>Modern Vision Tasks:</h3><ul><li><strong>Image Classification:</strong> Assigning labels to entire images</li><li><strong>Object Detection:</strong> Locating and identifying multiple objects (YOLO, Faster R-CNN)</li><li><strong>Semantic Segmentation:</strong> Classifying each pixel in an image</li><li><strong>Instance Segmentation:</strong> Identifying individual object instances</li><li><strong>Pose Estimation:</strong> Detecting human body joints and keypoints</li></ul>"""
        )
        
        # Module 6: Reinforcement Learning
        module6 = Module.objects.create(
            course=course,
            title="Reinforcement Learning",
            description="Learning through interaction and rewards",
            order=6
        )
        
        Lesson.objects.create(
            module=module6,
            title="Introduction to Reinforcement Learning",
            order=1,
            content="""<h2>Introduction to Reinforcement Learning</h2><p><strong>Reinforcement Learning (RL)</strong> is a learning paradigm where an agent learns by interacting with an environment, receiving rewards for good actions and penalties for bad ones.</p><h3>Key Components of RL:</h3><h4>Agent</h4><ul><li>The learner that interacts with the environment</li><li>Takes actions and receives feedback</li></ul><h4>Environment</h4><ul><li>The world the agent operates in</li><li>Responds to actions and provides rewards/observations</li></ul><h4>Actions</h4><ul><li>Choices the agent can make</li><li>Change the environment state</li></ul><h4>Rewards</h4><ul><li>Feedback signal (positive or negative)</li><li>Guide the agent toward optimal behavior</li></ul><h4>State</h4><ul><li>Current configuration of the environment</li><li>Determines what the agent observes</li></ul><h3>The RL Loop:</h3><ol><li>Agent observes current state</li><li>Agent selects and executes an action</li><li>Environment transitions to new state</li><li>Agent receives reward signal</li><li>Process repeats until episode terminates</li></ol><p>The goal is to maximize cumulative reward over time, learning an optimal <em>policy</em> (strategy for action selection).</p>"""
        )
        
        Lesson.objects.create(
            module=module6,
            title="Deep Reinforcement Learning",
            order=2,
            content="""<h2>Deep Reinforcement Learning</h2><p>Combining deep neural networks with reinforcement learning enables agents to handle complex, high-dimensional environments.</p><h3>Q-Learning and DQN</h3><p><strong>Q-Learning</strong> learns the value of taking each action in each state:</p><ul><li><strong>Q-value:</strong> Expected cumulative reward from taking action in state</li><li><strong>Deep Q-Networks (DQN):</strong> Use neural networks to approximate Q-values</li><li>Breakthrough: AlphaGo used similar techniques</li></ul><h3>Policy Gradient Methods</h3><p>Directly learn the policy (probability distribution over actions):</p><ul><li><strong>REINFORCE:</strong> Basic policy gradient algorithm</li><li><strong>Actor-Critic:</strong> Combines policy and value function learning</li><li><strong>PPO:</strong> Proximal Policy Optimization for stable training</li><li><strong>A3C:</strong> Asynchronous advantage actor-critic</li></ul><h3>Applications of Deep RL:</h3><ul><li><strong>Game Playing:</strong> AlphaGo, AlphaStar mastering complex games</li><li><strong>Robotics:</strong> Learning manipulation and navigation</li><li><strong>Autonomous Vehicles:</strong> Navigation and decision-making</li><li><strong>Resource Management:</strong> Network traffic, data center optimization</li><li><strong>Trading:</strong> Portfolio management and execution</li></ul><blockquote><p>Deep RL has achieved superhuman performance in many domains, from chess and Go to real-world robotic control.</p></blockquote>"""
        )
        
        # Module 7: AI in Real-World Applications
        module7 = Module.objects.create(
            course=course,
            title="Real-World AI Applications",
            description="How AI is transforming industries and society",
            order=7
        )
        
        Lesson.objects.create(
            module=module7,
            title="AI in Business and Industry",
            order=1,
            content="""<h2>AI in Business and Industry</h2><p>Artificial Intelligence is revolutionizing business operations, creating new opportunities and competitive advantages.</p><h3>Healthcare Applications</h3><ul><li><strong>Diagnostic Imaging:</strong> AI systems identify tumors and diseases from medical images with radiologist-level accuracy</li><li><strong>Drug Discovery:</strong> Accelerating molecular analysis and compound testing</li><li><strong>Personalized Medicine:</strong> Tailoring treatments based on genetic profiles</li><li><strong>Virtual Health Assistants:</strong> 24/7 patient support and symptom assessment</li></ul><h3>Financial Services</h3><ul><li><strong>Fraud Detection:</strong> Identifying suspicious transactions in real-time</li><li><strong>Algorithmic Trading:</strong> Automated investment decision-making</li><li><strong>Credit Scoring:</strong> More accurate and fair lending decisions</li><li><strong>Risk Management:</strong> Predicting market movements and portfolio risks</li></ul><h3>E-Commerce and Retail</h3><ul><li><strong>Recommendation Systems:</strong> Personalized product suggestions</li><li><strong>Demand Forecasting:</strong> Predicting product popularity</li><li><strong>Inventory Management:</strong> Optimizing stock levels</li><li><strong>Customer Service:</strong> Chatbots handling queries 24/7</li></ul><h3>Manufacturing</h3><ul><li><strong>Predictive Maintenance:</strong> Preventing equipment failures</li><li><strong>Quality Control:</strong> Automated defect detection</li><li><strong>Supply Chain Optimization:</strong> Efficient logistics and routing</li></ul>"""
        )
        
        Lesson.objects.create(
            module=module7,
            title="Emerging AI Frontiers",
            order=2,
            content="""<h2>Emerging AI Frontiers</h2><p>The field of AI continues to evolve, with exciting new frontiers pushing the boundaries of what's possible.</p><h3>Autonomous Systems</h3><p><strong>Autonomous Vehicles:</strong> Self-driving cars using perception, planning, and control</p><ul><li>Challenges: Safety, edge cases, legal liability</li><li>Companies: Tesla, Waymo, Cruise, Baidu</li><li>Timeline: Gradual deployment with increasing autonomy levels</li></ul><h3>Robotics</h3><ul><li><strong>Industrial Robots:</strong> Manufacturing and assembly with increasing dexterity</li><li><strong>Humanoid Robots:</strong> Robots designed to interact with human environments</li><li><strong>Swarm Robotics:</strong> Coordinated teams of simple robots</li><li><strong>Soft Robotics:</strong> Flexible robots for delicate manipulation</li></ul><h3>Extended Reality (XR)</h3><ul><li><strong>Augmented Reality (AR):</strong> AI overlaying digital information on physical world</li><li><strong>Virtual Reality (VR):</strong> AI-generated immersive environments</li><li><strong>Mixed Reality (MR):</strong> Seamless blend of physical and digital</li></ul><h3>Generative AI</h3><ul><li><strong>Text Generation:</strong> Creating human-like content</li><li><strong>Image Generation:</strong> Creating realistic images from descriptions (DALL-E, Midjourney)</li><li><strong>Code Generation:</strong> Automating software development (GitHub Copilot, ChatGPT)</li><li><strong>Audio Synthesis:</strong> Creating realistic speech and music</li></ul><blockquote><p>These emerging technologies promise to further transform how we work, learn, and interact with the world.</p></blockquote>"""
        )
        
        # Module 8: Ethics, Challenges, and Future of AI
        module8 = Module.objects.create(
            course=course,
            title="AI Ethics and Future Challenges",
            description="Responsible AI development and societal impact",
            order=8
        )
        
        Lesson.objects.create(
            module=module8,
            title="Ethics and Responsible AI",
            order=1,
            content="""<h2>Ethics and Responsible AI</h2><p>As AI becomes increasingly powerful and ubiquitous, ethical considerations become crucial for responsible development and deployment.</p><h3>Bias and Fairness</h3><p><strong>Algorithmic Bias:</strong> AI systems can perpetuate or amplify societal biases present in training data:</p><ul><li><strong>Hiring Systems:</strong> Discriminating against protected groups</li><li><strong>Facial Recognition:</strong> Lower accuracy for darker skin tones</li><li><strong>Criminal Justice:</strong> Unfair risk assessments in sentencing</li></ul><p><em>Mitigation Strategies:</em></p><ul><li>Diverse and representative training data</li><li>Regular fairness audits and testing</li><li>Transparency in decision-making processes</li><li>Inclusive teams in AI development</li></ul><h3>Transparency and Explainability</h3><ul><li><strong>Black Box Problem:</strong> Deep learning models make decisions without clear reasoning</li><li><strong>GDPR Right to Explanation:</strong> Users entitled to understand decisions affecting them</li><li><strong>Techniques:</strong> LIME, SHAP, attention visualization for model interpretability</li></ul><h3>Privacy and Data Protection</h3><ul><li><strong>Data Minimization:</strong> Collect only necessary data</li><li><strong>Differential Privacy:</strong> Add noise to protect individual privacy</li><li><strong>Federated Learning:</strong> Train models without centralizing sensitive data</li><li><strong>Data Governance:</strong> Clear policies on data usage and retention</li></ul><h3>Accountability</h3><ul><li>Clear responsibility for AI system outcomes</li><li>Meaningful human oversight and control</li><li>Mechanisms for recourse and appeal</li></ul>"""
        )
        
        Lesson.objects.create(
            module=module8,
            title="The Future of AI",
            order=2,
            content="""<h2>The Future of Artificial Intelligence</h2><p>The field of AI stands at an inflection point, with transformative developments on the horizon.</p><h3>Near-Term Developments (2024-2027)</h3><ul><li><strong>Multimodal AI:</strong> Systems that seamlessly work with text, images, audio, and video</li><li><strong>Efficient Models:</strong> Smaller, faster models requiring less computational resources</li><li><strong>AI Agents:</strong> Systems that can autonomously plan and execute complex tasks</li><li><strong>Improved Reasoning:</strong> Better at logical thinking and multi-step problem solving</li></ul><h3>Medium-Term Possibilities (2027-2035)</h3><ul><li><strong>General-Purpose AI:</strong> Systems that transfer knowledge across diverse domains</li><li><strong>Scientific Discovery:</strong> AI accelerating breakthroughs in physics, chemistry, biology</li><li><strong>Creative AI:</strong> Systems collaborating with humans in artistic endeavors</li><li><strong>Personalized Education:</strong> Adaptive learning systems for every student's needs</li></ul><h3>Challenges Ahead</h3><h4>Technical Challenges</h4><ul><li>Achieving artificial general intelligence (AGI)</li><li>Improving energy efficiency of large models</li><li>Making AI systems more robust and reliable</li></ul><h4>Societal Challenges</h4><ul><li><strong>Job Displacement:</strong> Workforce transition and reskilling</li><li><strong>Misinformation:</strong> AI-generated deepfakes and false information</li><li><strong>Concentration of Power:</strong> AI capabilities concentrated in few organizations</li><li><strong>Environmental Impact:</strong> Energy consumption of large models</li></ul><h3>Responsible AI Development</h3><p>Success requires collaboration between:</p><ul><li>Technologists and researchers</li><li>Policymakers and regulators</li><li>Ethicists and social scientists</li><li>Business leaders and communities</li></ul><blockquote><p>The future of AI depends not just on what we can build, but on how we choose to build it and deploy it responsibly for the benefit of humanity.</p></blockquote><p><strong>Your Role:</strong> As you continue learning AI, remember that technical excellence is only one part of the equation. Understanding ethics, societal impact, and responsible practices is equally important for becoming an AI professional who creates positive change.</p>"""
        )
        
        self.stdout.write(self.style.SUCCESS("✓ Successfully created AI course with 8 modules and 16 lessons"))
        self.stdout.write(self.style.SUCCESS("✓ All lessons contain richly formatted HTML content with headers, lists, formatting, and quotes"))

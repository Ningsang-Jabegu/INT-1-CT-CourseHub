import uuid
from django.db import models
from django.contrib.auth.models import User


class Role:
    """Role constants for the system."""
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

    CHOICES = [
        (ADMIN, "Admin"),
        (TEACHER, "Teacher"),
        (STUDENT, "Student"),
    ]


class UserProfile(models.Model):
    """Extended user profile with role information."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=10, choices=Role.CHOICES, default=Role.STUDENT)
    admin_secret_code = models.CharField(max_length=4, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class TeacherClass(models.Model):
    """A class created by a teacher with a unique code."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_classes")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=100, blank=True, help_text="e.g., '8 weeks', '2 months'")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True, help_text="Maximum number of students")
    class_code = models.CharField(max_length=10, unique=True, default='TEMP00')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Teacher Classes"

    def __str__(self):
        return f"{self.name} ({self.class_code}) - {self.teacher.username}"


class ClassEnrollment(models.Model):
    """Student enrollment in a teacher's class."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    teacher_class = models.ForeignKey(TeacherClass, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["student", "teacher_class"]
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.student.username} enrolled in {self.teacher_class.name}"


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher_class = models.ForeignKey(TeacherClass, on_delete=models.CASCADE, related_name="courses", null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self) -> str:
        return self.title


class Module(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, related_name="modules", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self) -> str:
        return f"{self.title} ({self.course})"


class Lesson(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.ForeignKey(Module, related_name="lessons", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    hero_media_type = models.CharField(
        max_length=10,
        choices=[("image", "Image"), ("video", "Video")],
        blank=True,
        null=True,
        help_text="Type of hero media to display (image or video)",
    )
    hero_media_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL for the hero media (image or video)",
    )
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self) -> str:
        return f"{self.title} ({self.module})"


class Topic(models.Model):
    """Hierarchical topic tree attached to a lesson."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(Lesson, related_name="topics", on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    hero_media_type = models.CharField(
        max_length=10,
        choices=[("image", "Image"), ("video", "Video")],
        blank=True,
        null=True,
        help_text="Type of hero media to display (image or video)",
    )
    hero_media_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL for the hero media (image or video)",
    )
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self) -> str:
        return f"{self.title} ({self.lesson})"


class KeyTakeaway(models.Model):
    """Key takeaways/summary points for a lesson or topic."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(Lesson, related_name="takeaways", on_delete=models.CASCADE, null=True, blank=True)
    topic = models.ForeignKey(Topic, related_name="takeaways", on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()  # Can contain HTML formatted text
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self) -> str:
        if self.lesson:
            return f"Takeaway for {self.lesson}"
        return f"Takeaway for {self.topic}"


class Exercise(models.Model):
    """Practice exercises for a lesson or topic."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(Lesson, related_name="exercises", on_delete=models.CASCADE, null=True, blank=True)
    topic = models.ForeignKey(Topic, related_name="exercises", on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()  # Can contain HTML formatted text
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self) -> str:
        if self.lesson:
            return f"Exercise for {self.lesson}"
        return f"Exercise for {self.topic}"


class Resource(models.Model):
    """Helpful resources/links for a lesson or topic."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(Lesson, related_name="resources", on_delete=models.CASCADE, null=True, blank=True)
    topic = models.ForeignKey(Topic, related_name="resources", on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)  # Can contain HTML formatted text
    url = models.URLField(max_length=500)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self) -> str:
        if self.lesson:
            return f"Resource for {self.lesson}"
        return f"Resource for {self.topic}"


class CourseCompletionCertificate(models.Model):
    """Persisted record of course completion with a unique certificate number."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_certificates")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="certificates")
    certificate_number = models.CharField(max_length=32, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["student", "course"]
        ordering = ["-issued_at"]

    def __str__(self) -> str:
        return f"{self.certificate_number} - {self.student.username} - {self.course.title}"


class CourseProgress(models.Model):
    """Tracks a student's progress and score for a course."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_progress")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="progress_records")
    obtained_score = models.FloatField(default=0)
    total_score = models.FloatField(default=0)
    is_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["student", "course"]
        ordering = ["-updated_at"]

    @property
    def percentage(self) -> float:
        if self.total_score <= 0:
            return 0.0
        return (self.obtained_score / self.total_score) * 100.0

    def __str__(self) -> str:
        return f"{self.student.username} - {self.course.title}: {self.obtained_score}/{self.total_score}"

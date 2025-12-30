from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Course, Lesson, Module, Topic, KeyTakeaway, Exercise, Resource, TeacherClass, ClassEnrollment, UserProfile


class KeyTakeawaySerializer(serializers.ModelSerializer):
    lessonId = serializers.PrimaryKeyRelatedField(source="lesson", queryset=Lesson.objects.all(), allow_null=True, required=False)
    topicId = serializers.PrimaryKeyRelatedField(source="topic", queryset=Topic.objects.all(), allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = KeyTakeaway
        fields = ["id", "content", "order", "lessonId", "topicId", "createdAt", "updatedAt"]


class ExerciseSerializer(serializers.ModelSerializer):
    lessonId = serializers.PrimaryKeyRelatedField(source="lesson", queryset=Lesson.objects.all(), allow_null=True, required=False)
    topicId = serializers.PrimaryKeyRelatedField(source="topic", queryset=Topic.objects.all(), allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Exercise
        fields = ["id", "title", "description", "order", "lessonId", "topicId", "createdAt", "updatedAt"]


class ResourceSerializer(serializers.ModelSerializer):
    lessonId = serializers.PrimaryKeyRelatedField(source="lesson", queryset=Lesson.objects.all(), allow_null=True, required=False)
    topicId = serializers.PrimaryKeyRelatedField(source="topic", queryset=Topic.objects.all(), allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Resource
        fields = ["id", "title", "description", "url", "order", "lessonId", "topicId", "createdAt", "updatedAt"]


class TopicSerializer(serializers.ModelSerializer):
    lessonId = serializers.PrimaryKeyRelatedField(source="lesson", queryset=Lesson.objects.all())
    parentId = serializers.PrimaryKeyRelatedField(
        source="parent",
        queryset=Topic.objects.all(),
        allow_null=True,
        required=False,
    )
    heroMediaType = serializers.CharField(source="hero_media_type", required=False, allow_blank=True, allow_null=True)
    heroMediaUrl = serializers.URLField(source="hero_media_url", required=False, allow_blank=True, allow_null=True)
    children = serializers.SerializerMethodField()
    takeaways = KeyTakeawaySerializer(many=True, read_only=True)
    exercises = ExerciseSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Topic
        fields = [
            "id",
            "title",
            "content",
            "order",
            "lessonId",
            "parentId",
            "heroMediaType",
            "heroMediaUrl",
            "children",
            "takeaways",
            "exercises",
            "resources",
            "createdAt",
            "updatedAt",
        ]

    def get_children(self, obj: Topic):
        # Serialize nested children to support arbitrarily deep trees.
        return TopicSerializer(obj.children.all(), many=True, context=self.context).data


class LessonSerializer(serializers.ModelSerializer):
    moduleId = serializers.PrimaryKeyRelatedField(source="module", queryset=Module.objects.all())
    heroMediaType = serializers.CharField(source="hero_media_type", required=False, allow_blank=True, allow_null=True)
    heroMediaUrl = serializers.URLField(source="hero_media_url", required=False, allow_blank=True, allow_null=True)
    topics = TopicSerializer(many=True, read_only=True)
    takeaways = KeyTakeawaySerializer(many=True, read_only=True)
    exercises = ExerciseSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "content",
            "heroMediaType",
            "heroMediaUrl",
            "order",
            "moduleId",
            "topics",
            "takeaways",
            "exercises",
            "resources",
            "createdAt",
            "updatedAt",
        ]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    courseId = serializers.PrimaryKeyRelatedField(source="course", queryset=Course.objects.all())
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "description",
            "order",
            "courseId",
            "lessons",
            "createdAt",
            "updatedAt",
        ]


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    teacherClassId = serializers.PrimaryKeyRelatedField(source="teacher_class", queryset=TeacherClass.objects.all(), allow_null=True, required=False)
    createdAt = serializers.DateField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "teacherClassId", "createdAt", "updatedAt", "modules"]


class UserProfileSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["id", "userId", "username", "first_name", "last_name", "email", "role", "admin_secret_code", "created_at", "updated_at"]
        read_only_fields = ["id", "userId", "username", "first_name", "last_name", "email", "created_at", "updated_at"]


class TeacherClassSerializer(serializers.ModelSerializer):
    teacherId = serializers.IntegerField(source="teacher.id", read_only=True)
    teacherUsername = serializers.CharField(source="teacher.username", read_only=True)
    teacherFirstName = serializers.CharField(source="teacher.first_name", read_only=True)
    teacherLastName = serializers.CharField(source="teacher.last_name", read_only=True)
    classCode = serializers.CharField(source="class_code", read_only=True)
    coursesCount = serializers.SerializerMethodField()
    studentsCount = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    # Nested teacher object for compatibility
    teacher = serializers.SerializerMethodField()

    class Meta:
        model = TeacherClass
        fields = ["id", "name", "description", "duration", "start_date", "end_date", "capacity", "classCode", "teacherId", "teacherUsername", "teacherFirstName", "teacherLastName", "teacher", "coursesCount", "studentsCount", "createdAt", "updatedAt"]
        read_only_fields = ["id", "classCode", "teacherId", "teacherFirstName", "teacherLastName", "coursesCount", "studentsCount", "createdAt", "updatedAt"]

    def get_teacher(self, obj):
        """Return nested teacher object with username for frontend compatibility."""
        if obj.teacher:
            return {
                "id": obj.teacher.id,
                "username": obj.teacher.username,
                "firstName": obj.teacher.first_name,
                "lastName": obj.teacher.last_name,
            }
        return None

    def get_coursesCount(self, obj):
        return obj.courses.count()

    def get_studentsCount(self, obj):
        return obj.enrollments.count()


class ClassEnrollmentSerializer(serializers.ModelSerializer):
    studentId = serializers.IntegerField(source="student.id", read_only=True)
    studentFirstName = serializers.CharField(source="student.first_name", read_only=True)
    studentLastName = serializers.CharField(source="student.last_name", read_only=True)
    className = serializers.CharField(source="teacher_class.name", read_only=True)
    classCode = serializers.CharField(source="teacher_class.class_code", read_only=True)
    teacherFirstName = serializers.CharField(source="teacher_class.teacher.first_name", read_only=True)
    teacherLastName = serializers.CharField(source="teacher_class.teacher.last_name", read_only=True)
    enrolledAt = serializers.DateTimeField(source="enrolled_at", read_only=True)

    class Meta:
        model = ClassEnrollment
        fields = ["id", "studentId", "studentFirstName", "studentLastName", "className", "classCode", "teacherFirstName", "teacherLastName", "enrolledAt"]
        read_only_fields = ["id", "studentId", "studentFirstName", "studentLastName", "className", "classCode", "teacherFirstName", "teacherLastName", "enrolledAt"]

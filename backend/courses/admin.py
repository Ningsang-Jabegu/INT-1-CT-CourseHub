from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Course, Lesson, Module, Topic, KeyTakeaway, Exercise, Resource, TeacherClass, ClassEnrollment, UserProfile, Role


# User Profile Inline Admin
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    fields = ("role",)
    extra = 0


# Custom User Admin
class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ("username", "first_name", "last_name", "email", "get_role", "is_staff", "date_joined")
    list_filter = ("date_joined", "is_staff", "is_active")
    search_fields = ("username", "first_name", "last_name", "email")
    
    def get_role(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.role if profile else "N/A"
    get_role.short_description = "Role"


# Unregister the old User admin and register the new one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# Teacher Class Admin
@admin.register(TeacherClass)
class TeacherClassAdmin(admin.ModelAdmin):
    list_display = ("name", "teacher", "class_code", "capacity", "start_date", "end_date", "created_at")
    list_filter = ("teacher", "created_at", "start_date")
    search_fields = ("name", "description", "class_code", "teacher__username")
    readonly_fields = ("class_code", "created_at", "updated_at")
    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "description", "teacher", "class_code")
        }),
        ("Class Details", {
            "fields": ("capacity", "duration", "start_date", "end_date")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make class_code read-only after creation."""
        if obj:  # Editing an existing object
            return self.readonly_fields
        return []  # Allow editing class_code during creation


# Class Enrollment Admin
@admin.register(ClassEnrollment)
class ClassEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "teacher_class", "enrolled_at")
    list_filter = ("teacher_class", "enrolled_at")
    search_fields = ("student__username", "teacher_class__name")
    readonly_fields = ("enrolled_at",)


# Key Takeaway Inline Admin
class KeyTakeawayInline(admin.TabularInline):
    model = KeyTakeaway
    fields = ("content", "order")
    extra = 1


# Exercise Inline Admin
class ExerciseInline(admin.TabularInline):
    model = Exercise
    fields = ("title", "description", "order")
    extra = 1


# Resource Inline Admin
class ResourceInline(admin.TabularInline):
    model = Resource
    fields = ("title", "description", "url", "order")
    extra = 1


# Course Admin
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "teacher_class", "get_teacher", "created_at", "updated_at")
    list_filter = ("teacher_class__teacher", "created_at", "teacher_class")
    search_fields = ("title", "description", "teacher_class__name")
    readonly_fields = ("created_at", "updated_at", "id")
    fieldsets = (
        ("Basic Information", {
            "fields": ("id", "title", "description", "teacher_class")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def get_teacher(self, obj):
        if obj.teacher_class:
            return obj.teacher_class.teacher.username
        return "N/A"
    get_teacher.short_description = "Teacher"


# Module Admin
@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "get_teacher", "order", "created_at", "updated_at")
    list_filter = ("course__teacher_class__teacher", "created_at", "course")
    search_fields = ("title", "description", "course__title")
    readonly_fields = ("created_at", "updated_at", "id")
    fieldsets = (
        ("Basic Information", {
            "fields": ("id", "title", "description", "course", "order")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def get_teacher(self, obj):
        if obj.course and obj.course.teacher_class:
            return obj.course.teacher_class.teacher.username
        return "N/A"
    get_teacher.short_description = "Teacher"


# Lesson Admin
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "module", "get_course", "get_teacher", "hero_media_type", "order", "created_at", "updated_at")
    list_filter = ("module__course__teacher_class__teacher", "created_at", "module__course")
    search_fields = ("title", "content", "module__title", "module__course__title", "hero_media_url")
    readonly_fields = ("created_at", "updated_at", "id")
    inlines = (KeyTakeawayInline, ExerciseInline, ResourceInline)
    fieldsets = (
        ("Basic Information", {
            "fields": ("id", "title", "content", "hero_media_type", "hero_media_url", "module", "order")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def get_course(self, obj):
        return obj.module.course.title if obj.module else "N/A"
    get_course.short_description = "Course"
    
    def get_teacher(self, obj):
        if obj.module and obj.module.course and obj.module.course.teacher_class:
            return obj.module.course.teacher_class.teacher.username
        return "N/A"
    get_teacher.short_description = "Teacher"


# Topic Admin
@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("title", "lesson", "get_course", "get_teacher", "hero_media_type", "order", "created_at", "updated_at")
    list_filter = ("lesson__module__course__teacher_class__teacher", "created_at", "lesson__module__course")
    search_fields = ("title", "content", "lesson__title", "lesson__module__course__title", "hero_media_url")
    readonly_fields = ("created_at", "updated_at", "id")
    inlines = (KeyTakeawayInline, ExerciseInline, ResourceInline)
    fieldsets = (
        ("Basic Information", {
            "fields": ("id", "title", "content", "hero_media_type", "hero_media_url", "lesson", "parent", "order")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def get_course(self, obj):
        return obj.lesson.module.course.title if obj.lesson else "N/A"
    get_course.short_description = "Course"
    
    def get_teacher(self, obj):
        if obj.lesson and obj.lesson.module and obj.lesson.module.course and obj.lesson.module.course.teacher_class:
            return obj.lesson.module.course.teacher_class.teacher.username
        return "N/A"
    get_teacher.short_description = "Teacher"


# Key Takeaway Admin
@admin.register(KeyTakeaway)
class KeyTakeawayAdmin(admin.ModelAdmin):
    list_display = ("content_preview", "lesson", "topic", "order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("content", "lesson__title", "topic__title")
    readonly_fields = ("created_at", "updated_at", "id")
    fieldsets = (
        ("Content", {
            "fields": ("id", "content", "lesson", "topic", "order")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = "Content"


# Exercise Admin
@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ("title", "lesson", "topic", "order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "description", "lesson__title", "topic__title")
    readonly_fields = ("created_at", "updated_at", "id")
    fieldsets = (
        ("Exercise Info", {
            "fields": ("id", "title", "description", "lesson", "topic", "order")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


# Resource Admin
@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "lesson", "topic", "order", "created_at")
    list_filter = ("created_at",)
    search_fields = ("title", "description", "url", "lesson__title", "topic__title")
    readonly_fields = ("created_at", "updated_at", "id")
    fieldsets = (
        ("Resource Info", {
            "fields": ("id", "title", "description", "url", "lesson", "topic", "order")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )

#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from courses.models import Course, ClassEnrollment, TeacherClass

print("=== MIGRATION VERIFICATION ===\n")

# Check course
course = Course.objects.first()
print(f"Course: {course.title}")
print(f"Teacher Class: {course.teacher_class.name if course.teacher_class else 'None'}")
print(f"Teacher: {course.teacher_class.teacher.username if course.teacher_class else 'N/A'}")

# Check enrollments
if course.teacher_class:
    enrollments = ClassEnrollment.objects.filter(teacher_class=course.teacher_class)
    print(f"\nEnrollments in {course.teacher_class.name}:")
    for enrollment in enrollments:
        print(f"  - {enrollment.student.username}")

# Test student query
print("\n=== TESTING STUDENT QUERY ===")
student = User.objects.get(username='student_1')
enrolled_classes = ClassEnrollment.objects.filter(student=student).values_list('teacher_class_id', flat=True)
visible_courses = Course.objects.filter(teacher_class_id__in=enrolled_classes)
print(f"Student: {student.username}")
print(f"Enrolled in: {', '.join([str(ec) for ec in ClassEnrollment.objects.filter(student=student).values_list('teacher_class__name', flat=True)])}")
print(f"Visible courses: {list(visible_courses.values_list('title', flat=True))}")

print("\n=== POONAM STATUS ===")
poonam = User.objects.get(username='poonam_teacher')
print(f"Username: {poonam.username}")
print(f"Name: {poonam.first_name} {poonam.last_name}")
print(f"Role: {poonam.profile.role}")
poonam_classes = TeacherClass.objects.filter(teacher=poonam)
print(f"Teacher Classes: {list(poonam_classes.values_list('name', flat=True))}")

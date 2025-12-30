#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from courses.models import Course, TeacherClass, UserProfile, Role, ClassEnrollment

print("=== COURSE MIGRATION SCRIPT ===\n")

# Step 1: Create Poonam if not exists
print("Step 1: Creating Poonam Tumbahamphe as Teacher...")
poonam, created = User.objects.get_or_create(
    username='poonam_teacher',
    defaults={
        'first_name': 'Poonam',
        'last_name': 'Tumbahamphe',
        'email': 'poonam@example.com',
    }
)

# Create profile if not exists
profile, profile_created = UserProfile.objects.get_or_create(
    user=poonam,
    defaults={'role': Role.TEACHER}
)

if created:
    poonam.set_password('Poonam@12345')
    poonam.save()
    print(f"✓ Created user: {poonam.username}")
else:
    print(f"✓ User exists: {poonam.username}")

if profile_created:
    print(f"✓ Created profile for {poonam.username} as {profile.role}")
else:
    print(f"✓ Profile exists for {poonam.username} as {profile.role}")

# Step 2: Create TeacherClass for Poonam
print("\nStep 2: Creating TeacherClass for Poonam...")
import secrets, string

def generate_class_code():
    """Generate a unique 6-character alphanumeric class code."""
    while True:
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        if not TeacherClass.objects.filter(class_code=code).exists():
            return code

poonam_class, poonam_class_created = TeacherClass.objects.get_or_create(
    teacher=poonam,
    name='Rotaract Club of Baneshwor',
    defaults={
        'description': 'Course for Rotaract Club members',
        'class_code': generate_class_code(),
    }
)

if poonam_class_created:
    print(f"✓ Created TeacherClass: {poonam_class.name} ({poonam_class.class_code})")
    print(f"  ID: {poonam_class.id}")
else:
    print(f"✓ TeacherClass exists: {poonam_class.name} ({poonam_class.class_code})")

# Step 3: Migrate the course to Poonam's class
print("\nStep 3: Associating course with Poonam's class...")
course = Course.objects.filter(title__icontains='Foundations').first()
if course:
    old_class = course.teacher_class
    course.teacher_class = poonam_class
    course.save()
    print(f"✓ Course '{course.title}' migrated")
    print(f"  From: {old_class}")
    print(f"  To: {poonam_class.name} ({poonam_class.class_code})")
else:
    print("✗ Course not found")

# Step 4: Enroll all students in the class
print("\nStep 4: Enrolling students in Poonam's class...")
students = User.objects.filter(profile__role=Role.STUDENT)
for student in students:
    enrollment, created = ClassEnrollment.objects.get_or_create(
        student=student,
        teacher_class=poonam_class,
    )
    if created:
        print(f"✓ Enrolled {student.username} in {poonam_class.name}")
    else:
        print(f"✓ {student.username} already enrolled in {poonam_class.name}")

print("\n=== MIGRATION COMPLETE ===")
print("\nFinal Status:")
print(f"Course: {course.title}")
print(f"  Teacher Class: {course.teacher_class.name}")
print(f"  Teacher: {course.teacher_class.teacher.username}")
print(f"  Class Code: {course.teacher_class.class_code}")
print(f"\nStudents enrolled: {poonam_class.enrollments.count()}")

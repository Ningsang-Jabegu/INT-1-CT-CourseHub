from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, BasePermission
from django.contrib.auth.models import User
import secrets
import string

from .models import Course, Lesson, Module, Topic, KeyTakeaway, Exercise, Resource, TeacherClass, ClassEnrollment, UserProfile, Role, CourseCompletionCertificate, CourseProgress
from .serializers import CourseSerializer, LessonSerializer, ModuleSerializer, TopicSerializer, KeyTakeawaySerializer, ExerciseSerializer, ResourceSerializer, TeacherClassSerializer, ClassEnrollmentSerializer, UserProfileSerializer


class IsAdminOrTeacherOfCourse(BasePermission):
    """Permission to check if user is admin or the teacher of the course's class."""
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Admin can do anything
        if profile and profile.role == Role.ADMIN:
            return True
        
        # Get the course (obj might be a course or have a course relationship)
        if isinstance(obj, Course):
            course = obj
        elif hasattr(obj, 'lesson') and hasattr(obj.lesson, 'module') and hasattr(obj.lesson.module, 'course'):
            course = obj.lesson.module.course
        elif hasattr(obj, 'module') and hasattr(obj.module, 'course'):
            course = obj.module.course
        else:
            return False
        
        # Check if teacher owns the course's teacher class
        if course.teacher_class and course.teacher_class.teacher == user:
            return True
        
        return False



def generate_class_code():
    """Generate a unique 6-character alphanumeric class code."""
    while True:
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        if not TeacherClass.objects.filter(class_code=code).exists():
            return code


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        
        queryset = Course.objects.all().prefetch_related(
            "modules__lessons__topics__children",
            "modules__lessons__takeaways",
            "modules__lessons",
        )
        
        # Admin can see all courses
        if profile and profile.role == Role.ADMIN:
            return queryset
        
        # Teacher can see courses in their classes
        if profile and profile.role == Role.TEACHER:
            teacher_class_ids = TeacherClass.objects.filter(teacher=user).values_list('id', flat=True)
            return queryset.filter(teacher_class_id__in=teacher_class_ids)
        
        # Student can see courses in enrolled classes
        if profile and profile.role == Role.STUDENT:
            enrolled_class_ids = ClassEnrollment.objects.filter(student=user).values_list('teacher_class_id', flat=True)
            return queryset.filter(teacher_class_id__in=enrolled_class_ids)

        # Anonymous users: allow read-only access to all courses for landing page
        return queryset

    def create(self, request, *args, **kwargs):
        """Create a course with permission checks."""
        user = request.user
        profile = getattr(user, 'profile', None)
        teacher_class_id = request.data.get('teacherClassId')
        
        # Course must be assigned to a teacher class
        if not teacher_class_id:
            return Response(
                {'error': 'teacherClassId is required. Course must be assigned to a teacher class.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            teacher_class = TeacherClass.objects.get(id=teacher_class_id)
        except TeacherClass.DoesNotExist:
            return Response({'error': 'Teacher class not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Permission check: Only admin or the teacher who owns the class can create courses
        if profile and profile.role == Role.TEACHER and teacher_class.teacher != user:
            return Response(
                {'error': 'You can only create courses for your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Call parent create method
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update a course with permission checks."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Check if trying to change teacher_class
        new_teacher_class_id = request.data.get('teacherClassId')
        if new_teacher_class_id and new_teacher_class_id != str(instance.teacher_class_id):
            try:
                new_class = TeacherClass.objects.get(id=new_teacher_class_id)
                # Permission check: Only admin or the new class teacher can reassign
                if profile and profile.role == Role.TEACHER and new_class.teacher != user:
                    return Response(
                        {'error': 'You can only assign courses to your own teacher classes.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except TeacherClass.DoesNotExist:
                return Response({'error': 'Teacher class not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete a course with permission checks."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Permission check: Only admin or the teacher of the class can delete
        if profile and profile.role == Role.TEACHER and instance.teacher_class.teacher != user:
            return Response(
                {'error': 'You can only delete courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="generate-certificate")
    def generate_certificate(self, request, pk=None):
        """Generate and return a PDF certificate for the authenticated student for this course.

        Rules:
        - Only students can generate their own certificate.
        - Student must be enrolled in the course's teacher class (if present).
        - A unique certificate number is created and persisted; subsequent calls return the same record.
        """
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        profile = getattr(user, "profile", None)

        if not profile or profile.role != Role.STUDENT:
            return Response({"error": "Only students can generate certificates"}, status=status.HTTP_403_FORBIDDEN)

        # If course is attached to a teacher class, ensure student is enrolled
        if course.teacher_class:
            enrolled = ClassEnrollment.objects.filter(student=user, teacher_class=course.teacher_class).exists()
            if not enrolled:
                return Response({"error": "You must be enrolled in this course's class to generate a certificate"}, status=status.HTTP_403_FORBIDDEN)

        # Progress check: just verify student has started the course
        # Allow certificate generation once course is accessed/started
        progress = CourseProgress.objects.filter(student=user, course=course).first()
        if not progress:
            # Create initial progress record if student hasn't started yet
            progress = CourseProgress.objects.create(
                student=user,
                course=course,
                obtained_score=0,
                total_score=0,
                is_completed=False,
            )

        # Create or get existing certificate record
        cert = CourseCompletionCertificate.objects.filter(student=user, course=course).first()
        if not cert:
            # Unique cert number pattern: CH-YYYYMMDD-XXXXXX (random)
            import datetime, secrets, string
            date_part = datetime.datetime.utcnow().strftime("%Y%m%d")
            rand_part = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
            cert_number = f"CH-{date_part}-{rand_part}"
            cert = CourseCompletionCertificate.objects.create(
                student=user,
                course=course,
                certificate_number=cert_number,
            )

        # Generate PDF using reportlab
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from io import BytesIO

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Border
        margin = 36
        c.setStrokeColor(colors.HexColor("#6B46C1"))  # purple
        c.setLineWidth(3)
        c.rect(margin, margin, width - 2 * margin, height - 2 * margin)

        # Title
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(colors.HexColor("#1F2937"))
        c.drawCentredString(width / 2, height - 150, "Certificate of Completion")

        # Subtitle
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor("#374151"))
        c.drawCentredString(width / 2, height - 180, "This certifies that")

        # Student Name
        full_name = (user.first_name + " " + user.last_name).strip() or user.username
        c.setFont("Helvetica-Bold", 22)
        c.setFillColor(colors.HexColor("#111827"))
        c.drawCentredString(width / 2, height - 220, full_name)

        # Course title line
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor("#374151"))
        c.drawCentredString(width / 2, height - 260, "has successfully completed the course")

        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(colors.HexColor("#111827"))
        c.drawCentredString(width / 2, height - 290, course.title)

        # Additional details
        teacher_name = ""
        if course.teacher_class and course.teacher_class.teacher:
            t = course.teacher_class.teacher
            teacher_name = (t.first_name + " " + t.last_name).strip() or t.username

        c.setFont("Helvetica", 12)
        c.setFillColor(colors.HexColor("#6B7280"))
        y = height - 340
        if teacher_name:
            c.drawCentredString(width / 2, y, f"Instructor: {teacher_name}")
            y -= 20

        c.drawCentredString(width / 2, y, f"Issued on: {cert.issued_at.strftime('%Y-%m-%d')}")
        y -= 20
        c.drawCentredString(width / 2, y, f"Certificate No: {cert.certificate_number}")
        y -= 20
        
        # Show score only if progress has been tracked
        if progress and progress.total_score > 0:
            c.drawCentredString(width / 2, y, f"Score: {progress.obtained_score:.1f} / {progress.total_score:.1f} ({progress.percentage:.1f}%)")
            y -= 20

        # Signature line
        c.setStrokeColor(colors.HexColor("#9CA3AF"))
        c.setLineWidth(1)
        c.line(width / 2 - 150, 120, width / 2 + 150, 120)
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawCentredString(width / 2, 100, "Authorized Signature")

        c.showPage()
        c.save()

        buffer.seek(0)
        from django.http import HttpResponse
        response = HttpResponse(buffer.read(), content_type="application/pdf")
        filename = f"certificate_{cert.certificate_number}.pdf"
        response["Content-Disposition"] = f"attachment; filename=\"{filename}\""
        return response

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="certificate-info")
    def get_certificate_info(self, request, pk=None):
        """Get certificate information for sharing (LinkedIn, etc).
        
        Returns certificate details and course/student information needed for sharing.
        """
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        profile = getattr(user, "profile", None)

        if not profile or profile.role != Role.STUDENT:
            return Response({"error": "Only students can retrieve certificate info"}, status=status.HTTP_403_FORBIDDEN)

        # Check if student has a certificate
        cert = CourseCompletionCertificate.objects.filter(student=user, course=course).first()
        if not cert:
            return Response({"error": "Certificate not found. Generate certificate first."}, status=status.HTTP_404_NOT_FOUND)

        # Get progress info
        progress = CourseProgress.objects.filter(student=user, course=course).first()

        full_name = (user.first_name + " " + user.last_name).strip() or user.username
        teacher_name = ""
        if course.teacher_class and course.teacher_class.teacher:
            t = course.teacher_class.teacher
            teacher_name = (t.first_name + " " + t.last_name).strip() or t.username

        return Response({
            "certificateNumber": cert.certificate_number,
            "issuedAt": cert.issued_at.isoformat(),
            "studentName": full_name,
            "courseTitle": course.title,
            "courseDescription": course.description,
            "instructorName": teacher_name,
            "obtainedScore": progress.obtained_score if progress else 0,
            "totalScore": progress.total_score if progress else 0,
            "percentage": progress.percentage if progress else 0,
            "userName": user.username,
            "userEmail": user.email,
        })

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated], url_path="progress")
    def update_progress(self, request, pk=None):
        """Update or create a student's course progress and score.

        Expected payload: { obtained_score: number, total_score: number, is_completed: bool }
        Only students, and they must be enrolled in the class (if class-bound).
        """
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        profile = getattr(user, "profile", None)
        if not profile or profile.role != Role.STUDENT:
            return Response({"error": "Only students can update progress"}, status=status.HTTP_403_FORBIDDEN)

        if course.teacher_class:
            enrolled = ClassEnrollment.objects.filter(student=user, teacher_class=course.teacher_class).exists()
            if not enrolled:
                return Response({"error": "You must be enrolled in this course's class."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data or {}
        try:
            obtained = float(data.get("obtained_score", 0))
            total = float(data.get("total_score", 0))
        except (TypeError, ValueError):
            return Response({"error": "Scores must be numbers."}, status=status.HTTP_400_BAD_REQUEST)

        if total <= 0:
            return Response({"error": "total_score must be greater than 0."}, status=status.HTTP_400_BAD_REQUEST)
        if obtained < 0:
            return Response({"error": "obtained_score cannot be negative."}, status=status.HTTP_400_BAD_REQUEST)
        if obtained > total:
            obtained = total

        is_completed = bool(data.get("is_completed", False))

        progress, _ = CourseProgress.objects.update_or_create(
            student=user,
            course=course,
            defaults={
                "obtained_score": obtained,
                "total_score": total,
                "is_completed": is_completed,
            },
        )

        return Response(
            {
                "obtained_score": progress.obtained_score,
                "total_score": progress.total_score,
                "percentage": progress.percentage,
                "is_completed": progress.is_completed,
            }
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='bulk-delete')
    def bulk_delete(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For teachers, only allow deleting own courses
        if profile and profile.role == Role.TEACHER:
            courses = Course.objects.filter(id__in=ids)
            for course in courses:
                if course.teacher_class and course.teacher_class.teacher != user:
                    return Response(
                        {'error': f'You can only delete courses in your own teacher classes.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        deleted_count, _ = Course.objects.filter(id__in=ids).delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[], url_path='verify-certificate')
    def verify_certificate(self, request):
        """Public endpoint to verify a certificate by certificate number.
        
        Query params:
        - certificate_number: The certificate number to verify (required)
        - include_student: Include student name in response (optional, default: True)
        
        Returns certificate details if valid, error otherwise.
        """
        cert_number = request.query_params.get('certificate_number', '').strip()
        
        if not cert_number:
            return Response(
                {"error": "Certificate number is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cert = CourseCompletionCertificate.objects.select_related(
                'student', 'course', 'course__teacher_class', 'course__teacher_class__teacher'
            ).get(certificate_number=cert_number)
        except CourseCompletionCertificate.DoesNotExist:
            return Response(
                {"error": "Certificate not found or invalid certificate number"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get progress for score info
        progress = CourseProgress.objects.filter(
            student=cert.student, 
            course=cert.course
        ).first()
        
        student_name = (cert.student.first_name + " " + cert.student.last_name).strip() or cert.student.username
        teacher_name = ""
        if cert.course.teacher_class and cert.course.teacher_class.teacher:
            t = cert.course.teacher_class.teacher
            teacher_name = (t.first_name + " " + t.last_name).strip() or t.username
        
        response_data = {
            "valid": True,
            "certificateNumber": cert.certificate_number,
            "issuedAt": cert.issued_at.isoformat(),
            "courseTitle": cert.course.title,
            "courseDescription": cert.course.description,
            "studentName": student_name,
            "instructorName": teacher_name,
            "obtainedScore": progress.obtained_score if progress else 0,
            "totalScore": progress.total_score if progress else 0,
            "percentage": progress.percentage if progress else 0,
            "verifiedAt": "2025-12-30T00:00:00Z",  # Current verification timestamp
            "certificateStatus": "Valid and Active",
        }
        
        return Response(response_data)



class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all().select_related("course").prefetch_related(
        "lessons__topics__children",
        "lessons__takeaways",
        "lessons",
    )
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create a module with permission check."""
        user = request.user
        profile = getattr(user, 'profile', None)
        course_id = request.data.get('courseId')
        
        if not course_id:
            return Response({'error': 'courseId is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Permission check: Only admin or the teacher of the course can create modules
        if profile and profile.role == Role.TEACHER and (not course.teacher_class or course.teacher_class.teacher != user):
            return Response(
                {'error': 'You can only add modules to courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update a module with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        course = instance.course
        
        # Permission check: Only admin or the teacher of the course can update
        if profile and profile.role == Role.TEACHER and (not course.teacher_class or course.teacher_class.teacher != user):
            return Response(
                {'error': 'You can only update modules in courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete a module with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        course = instance.course
        
        # Permission check: Only admin or the teacher of the course can delete
        if profile and profile.role == Role.TEACHER and (not course.teacher_class or course.teacher_class.teacher != user):
            return Response(
                {'error': 'You can only delete modules from courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='bulk-delete')
    def bulk_delete(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For teachers, check they own the course
        if profile and profile.role == Role.TEACHER:
            modules = Module.objects.filter(id__in=ids)
            for module in modules:
                course = module.course
                if not course.teacher_class or course.teacher_class.teacher != user:
                    return Response(
                        {'error': 'You can only delete modules from courses in your own teacher classes.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        deleted_count, _ = Module.objects.filter(id__in=ids).delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all().select_related("module", "module__course").prefetch_related(
        "topics__children",
        "takeaways",
        "exercises",
        "resources",
    )
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Extract nested data (ensure plain list)
        takeaways_data = data.pop('keyTakeaways', []) or []
        exercises_data = data.pop('exercises', []) or []
        resources_data = data.pop('resources', []) or []

        # Normalize QueryDict single-value lists
        if not isinstance(takeaways_data, list):
            takeaways_data = [takeaways_data]
        if not isinstance(exercises_data, list):
            exercises_data = [exercises_data]
        if not isinstance(resources_data, list):
            resources_data = [resources_data]

        # Create lesson
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save()

        # Create key takeaways
        for index, content in enumerate(takeaways_data):
            if isinstance(content, str):
                KeyTakeaway.objects.create(lesson=lesson, content=content, order=index)

        # Create exercises
        for index, exercise in enumerate(exercises_data):
            if isinstance(exercise, dict):
                Exercise.objects.create(
                    lesson=lesson,
                    title=exercise.get('title', ''),
                    description=exercise.get('description', ''),
                    order=index
                )

        # Create resources
        for index, resource in enumerate(resources_data):
            if isinstance(resource, dict):
                Resource.objects.create(
                    lesson=lesson,
                    title=resource.get('title', ''),
                    description=resource.get('description', ''),
                    url=resource.get('url', ''),
                    order=index
                )

        # Return complete lesson with nested data
        lesson.refresh_from_db()
        output_serializer = self.get_serializer(lesson)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Update a lesson with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        course = instance.module.course
        
        # Permission check: Only admin or the teacher of the course can update
        if profile and profile.role == Role.TEACHER and (not course.teacher_class or course.teacher_class.teacher != user):
            return Response(
                {'error': 'You can only update lessons in courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete a lesson with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        course = instance.module.course
        
        # Permission check: Only admin or the teacher of the course can delete
        if profile and profile.role == Role.TEACHER and (not course.teacher_class or course.teacher_class.teacher != user):
            return Response(
                {'error': 'You can only delete lessons from courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='bulk-delete')
    def bulk_delete(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For teachers, check they own the course
        if profile and profile.role == Role.TEACHER:
            lessons = Lesson.objects.filter(id__in=ids)
            for lesson in lessons:
                course = lesson.module.course
                if not course.teacher_class or course.teacher_class.teacher != user:
                    return Response(
                        {'error': 'You can only delete lessons from courses in your own teacher classes.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        deleted_count, _ = Lesson.objects.filter(id__in=ids).delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all().select_related("lesson", "parent", "lesson__module").prefetch_related(
        "takeaways",
        "exercises",
        "resources",
    )
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Extract nested data (ensure plain list)
        takeaways_data = data.pop('keyTakeaways', []) or []
        exercises_data = data.pop('exercises', []) or []
        resources_data = data.pop('resources', []) or []

        if not isinstance(takeaways_data, list):
            takeaways_data = [takeaways_data]
        if not isinstance(exercises_data, list):
            exercises_data = [exercises_data]
        if not isinstance(resources_data, list):
            resources_data = [resources_data]

        # Create topic
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        topic = serializer.save()

        # Create key takeaways
        for index, content in enumerate(takeaways_data):
            if isinstance(content, str):
                KeyTakeaway.objects.create(topic=topic, content=content, order=index)

        # Create exercises
        for index, exercise in enumerate(exercises_data):
            if isinstance(exercise, dict):
                Exercise.objects.create(
                    topic=topic,
                    title=exercise.get('title', ''),
                    description=exercise.get('description', ''),
                    order=index
                )

        # Create resources
        for index, resource in enumerate(resources_data):
            if isinstance(resource, dict):
                Resource.objects.create(
                    topic=topic,
                    title=resource.get('title', ''),
                    description=resource.get('description', ''),
                    url=resource.get('url', ''),
                    order=index
                )

        # Return complete topic with nested data
        topic.refresh_from_db()
        output_serializer = self.get_serializer(topic)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """Update a topic with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        course = instance.lesson.module.course
        
        # Permission check: Only admin or the teacher of the course can update
        if profile and profile.role == Role.TEACHER and (not course.teacher_class or course.teacher_class.teacher != user):
            return Response(
                {'error': 'You can only update topics in courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete a topic with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        course = instance.lesson.module.course
        
        # Permission check: Only admin or the teacher of the course can delete
        if profile and profile.role == Role.TEACHER and (not course.teacher_class or course.teacher_class.teacher != user):
            return Response(
                {'error': 'You can only delete topics from courses in your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='bulk-delete')
    def bulk_delete(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For teachers, check they own the course
        if profile and profile.role == Role.TEACHER:
            topics = Topic.objects.filter(id__in=ids)
            for topic in topics:
                course = topic.lesson.module.course
                if not course.teacher_class or course.teacher_class.teacher != user:
                    return Response(
                        {'error': 'You can only delete topics from courses in your own teacher classes.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        deleted_count, _ = Topic.objects.filter(id__in=ids).delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)


class KeyTakeawayViewSet(viewsets.ModelViewSet):
    queryset = KeyTakeaway.objects.all().select_related("lesson")
    serializer_class = KeyTakeawaySerializer


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().select_related("lesson", "topic")
    serializer_class = ExerciseSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all().select_related("lesson", "topic")
    serializer_class = ResourceSerializer


class TeacherClassViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherClassSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        
        # Admin can see all classes
        if profile and profile.role == Role.ADMIN:
            return TeacherClass.objects.all().select_related('teacher')
        
        # Teacher can see only their classes
        if profile and profile.role == Role.TEACHER:
            return TeacherClass.objects.filter(teacher=user).select_related('teacher')
        
        # Students can see classes they're enrolled in
        if profile and profile.role == Role.STUDENT:
            enrolled_class_ids = ClassEnrollment.objects.filter(student=user).values_list('teacher_class_id', flat=True)
            return TeacherClass.objects.filter(id__in=enrolled_class_ids).select_related('teacher')
        
        return TeacherClass.objects.none()

    def perform_create(self, serializer):
        # Auto-generate class code and set teacher
        serializer.save(teacher=self.request.user, class_code=generate_class_code())

    def update(self, request, *args, **kwargs):
        """Update a teacher class with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Permission check: Only admin or the teacher who owns the class can update
        if profile and profile.role == Role.TEACHER and instance.teacher != user:
            return Response(
                {'error': 'You can only update your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete a teacher class with permission check."""
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Permission check: Only admin or the teacher who owns the class can delete
        if profile and profile.role == Role.TEACHER and instance.teacher != user:
            return Response(
                {'error': 'You can only delete your own teacher classes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Student enrollment endpoint."""
        class_code = request.data.get('class_code', '').strip().upper()
        
        if not class_code:
            return Response({'error': 'Class code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            teacher_class = TeacherClass.objects.get(class_code=class_code)
        except TeacherClass.DoesNotExist:
            return Response({'error': 'Invalid class code'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already enrolled
        if ClassEnrollment.objects.filter(student=request.user, teacher_class=teacher_class).exists():
            return Response({'error': 'Already enrolled in this class'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create enrollment
        enrollment = ClassEnrollment.objects.create(student=request.user, teacher_class=teacher_class)
        serializer = ClassEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ClassEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ClassEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        
        # Admin can see all enrollments
        if profile and profile.role == Role.ADMIN:
            return ClassEnrollment.objects.all().select_related('student', 'teacher_class__teacher')
        
        # Teacher can see enrollments in their classes
        if profile and profile.role == Role.TEACHER:
            teacher_class_ids = TeacherClass.objects.filter(teacher=user).values_list('id', flat=True)
            return ClassEnrollment.objects.filter(teacher_class_id__in=teacher_class_ids).select_related('student', 'teacher_class__teacher')
        
        # Student can see only their enrollments
        if profile and profile.role == Role.STUDENT:
            return ClassEnrollment.objects.filter(student=user).select_related('student', 'teacher_class__teacher')
        
        return ClassEnrollment.objects.none()

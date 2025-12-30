from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CourseViewSet, LessonViewSet, ModuleViewSet, TopicViewSet, KeyTakeawayViewSet, ExerciseViewSet, ResourceViewSet, TeacherClassViewSet, ClassEnrollmentViewSet
from .auth_views import register_view, login_view, logout_view, check_auth, csrf_token, users_view, users_bulk_delete, user_detail_view

router = DefaultRouter()
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"modules", ModuleViewSet)
router.register(r"lessons", LessonViewSet)
router.register(r"topics", TopicViewSet)
router.register(r"takeaways", KeyTakeawayViewSet)
router.register(r"exercises", ExerciseViewSet)
router.register(r"resources", ResourceViewSet)
router.register(r"classes", TeacherClassViewSet, basename="teacher-class")
router.register(r"enrollments", ClassEnrollmentViewSet, basename="enrollment")

urlpatterns = [
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/check/', check_auth, name='check_auth'),
    path('auth/csrf/', csrf_token, name='csrf_token'),
    path('auth/users/', users_view, name='users'),
    path('auth/users/<int:user_id>/', user_detail_view, name='user_detail'),
    path('auth/users/bulk-delete/', users_bulk_delete, name='users_bulk_delete'),
] + router.urls

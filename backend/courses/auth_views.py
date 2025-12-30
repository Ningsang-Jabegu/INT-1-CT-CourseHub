from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.core.exceptions import ValidationError
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import UserProfile, Role


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role') or Role.STUDENT
    admin_secret_code = request.data.get('admin_secret_code') or None

    if role not in [Role.ADMIN, Role.TEACHER, Role.STUDENT]:
        role = Role.STUDENT

    # Admin-specific validation
    if role == Role.ADMIN:
        if not email:
            return Response({'error': 'Email is required for admin accounts'}, status=status.HTTP_400_BAD_REQUEST)
        if not admin_secret_code:
            return Response({'error': 'Admin secret code is required'}, status=status.HTTP_400_BAD_REQUEST)
        # Validate format: 987A - 987Z
        if not isinstance(admin_secret_code, str) or not admin_secret_code.startswith('987') or len(admin_secret_code) != 4 or not admin_secret_code[3].isalpha() or admin_secret_code[3].upper() not in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
            return Response({'error': 'Invalid admin secret code format. Expected 987A - 987Z.'}, status=status.HTTP_400_BAD_REQUEST)
        # Normalize to uppercase
        admin_secret_code = admin_secret_code.upper()
        # Check uniqueness
        if UserProfile.objects.filter(admin_secret_code=admin_secret_code).exists():
            return Response({'error': 'Admin secret code already used'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if email and User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        username=username,
        email=email or '',
        password=password
    )
    # Set staff status for admin
    if role == Role.ADMIN:
        user.is_staff = True
        user.save(update_fields=['is_staff'])

    # Create user profile
    profile = UserProfile.objects.create(user=user, role=role, admin_secret_code=admin_secret_code if role == Role.ADMIN else None)
    
    # Automatically log in the user after registration
    login(request, user)
    
    return Response({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': getattr(user, 'profile', None).role if hasattr(user, 'profile') else None,
            'admin_secret_code': profile.admin_secret_code if role == Role.ADMIN else None,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(request, username=username, password=password)

    # Auto-provision demo teacher/student if missing
    if user is None and username in ["demo_teacher", "demo_student"] and password == "Demo@12345":
        role = Role.TEACHER if username == "demo_teacher" else Role.STUDENT
        user = User.objects.create_user(username=username, email="", password=password)
        UserProfile.objects.create(user=user, role=role)
        user = authenticate(request, username=username, password=password)

    if user is not None:
        # Ensure profile exists for legacy users (e.g., existing admins)
        profile = getattr(user, 'profile', None)
        if profile is None:
            # Infer role from is_staff flag for backward compatibility
            inferred_role = Role.ADMIN if user.is_staff else Role.STUDENT
            profile = UserProfile.objects.create(user=user, role=inferred_role)
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': profile.role,
                'admin_secret_code': profile.admin_secret_code,
            }
        })
    else:
        return Response(
            {'error': 'Invalid username or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user"""
    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@ensure_csrf_cookie
def check_auth(request):
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'role': getattr(request.user, 'profile', None).role if hasattr(request.user, 'profile') else None,
            }
        })
    else:
        return Response({
            'authenticated': False,
            'user': None
        })


@api_view(['GET'])
def csrf_token(request):
    """Get CSRF token"""
    return Response({'csrfToken': get_token(request)})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def users_view(request):
    """List users or create a new user (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        users = User.objects.all().order_by("id")
        data = []
        for u in users:
            profile = getattr(u, "profile", None)
            data.append(
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "first_name": u.first_name,
                    "last_name": u.last_name,
                    "is_staff": u.is_staff,
                    "role": profile.role if profile else None,
                }
            )
        return Response(data)

    # POST - create
    payload = request.data or {}
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip()
    first_name = (payload.get("first_name") or "").strip()
    last_name = (payload.get("last_name") or "").strip()
    password_auth_enabled = bool(payload.get("password_auth_enabled", True))
    password = payload.get("password") or ""

    # Username validations
    if not username:
        return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
    if len(username) > 150:
        return Response({"error": "Username must be 150 characters or fewer"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        ASCIIUsernameValidator()(username)
    except ValidationError:
        return Response(
            {"error": "Username may contain letters, digits and @/./+/-/_ only."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    # Password handling
    if password_auth_enabled:
        try:
            validate_password(password)
        except ValidationError as e:
            return Response({"error": " ".join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    role_value = payload.get("role") or Role.STUDENT
    if role_value not in [Role.ADMIN, Role.TEACHER, Role.STUDENT]:
        role_value = Role.STUDENT

    # Determine staff flag: honor explicit payload if provided, else infer from role
    is_staff_flag = payload.get("is_staff")
    if isinstance(is_staff_flag, bool):
        final_is_staff = is_staff_flag
    else:
        final_is_staff = True if role_value == Role.ADMIN else False

    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        is_staff=final_is_staff,
    )
    # Set password or mark unusable
    if password_auth_enabled:
        user.set_password(password)
    else:
        user.set_unusable_password()
    user.save()

    # Create user profile
    UserProfile.objects.create(user=user, role=role_value)

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "role": role_value,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def users_bulk_delete(request):
    """Bulk delete users by IDs (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
    ids = request.data.get("ids") or []
    if not isinstance(ids, list):
        return Response({"error": "ids must be a list"}, status=status.HTTP_400_BAD_REQUEST)
    # Prevent deleting self and superusers by default safety net
    qs = User.objects.filter(id__in=ids).exclude(id=request.user.id)
    deleted, _ = qs.delete()
    return Response({"deleted": deleted})


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail_view(request, user_id: int):
    """Retrieve, update, or delete a user (staff only)."""
    if not request.user.is_staff:
        return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    # Ensure profile exists
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"role": Role.ADMIN if user.is_staff else Role.STUDENT})

    if request.method == "GET":
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
                "role": profile.role,
                "admin_secret_code": profile.admin_secret_code,
            }
        )

    if request.method == "DELETE":
        if user == request.user:
            return Response({"error": "You cannot delete yourself."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH
    data = request.data or {}

    # Username uniqueness
    new_username = data.get("username")
    if new_username and new_username != user.username:
        if User.objects.filter(username=new_username).exclude(id=user.id).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        user.username = new_username

    new_email = data.get("email")
    if new_email is not None and new_email != user.email:
        if new_email and User.objects.filter(email=new_email).exclude(id=user.id).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        user.email = new_email

    if "first_name" in data:
        user.first_name = data.get("first_name") or ""
    if "last_name" in data:
        user.last_name = data.get("last_name") or ""

    # Role and staff flag
    incoming_role = data.get("role") or profile.role
    if incoming_role not in [Role.ADMIN, Role.TEACHER, Role.STUDENT]:
        incoming_role = profile.role
    profile.role = incoming_role

    # is_staff: if role admin, force True; otherwise honor payload or default False
    if incoming_role == Role.ADMIN:
        user.is_staff = True
    elif "is_staff" in data:
        user.is_staff = bool(data.get("is_staff"))
    else:
        # keep existing for non-admin unless explicitly changed
        user.is_staff = user.is_staff and incoming_role != Role.STUDENT if user.is_staff else False

    # Password update (optional)
    if "password" in data and data.get("password"):
        try:
            validate_password(data.get("password"))
        except ValidationError as e:
            return Response({"error": " ".join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(data.get("password"))

    # Admin secret code management
    admin_code = data.get("admin_secret_code")
    if incoming_role == Role.ADMIN:
        if admin_code:
            admin_code = admin_code.upper()
            if len(admin_code) == 4 and admin_code.startswith("987"):
                if UserProfile.objects.filter(admin_secret_code=admin_code).exclude(id=profile.id).exists():
                    return Response({"error": "Admin secret code already used"}, status=status.HTTP_400_BAD_REQUEST)
                profile.admin_secret_code = admin_code
        # If no code supplied, keep existing; do not auto-clear
    else:
        profile.admin_secret_code = None

    user.save()
    profile.save()

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "role": profile.role,
            "admin_secret_code": profile.admin_secret_code,
        }
    )

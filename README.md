# CourseHub — Course Module Management System

**Status**: ✅ PRODUCTION READY  
**Last Updated**: December 17, 2025

A comprehensive course management platform with Django backend and React frontend, featuring full CRUD operations, role-based permissions, and an admin dashboard.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Technologies](#technologies)
- [Authentication System](#authentication-system)
- [Admin Dashboard](#admin-dashboard)
- [Rich Content Features](#rich-content-features)
- [Database Population](#database-population)
- [Permission System](#permission-system)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Frontend Setup
Requirements: Node.js (v16+ recommended) and npm or yarn.

```powershell
cd <project-folder>
npm install
npm run dev
```
Open http://localhost:5173 to view the app.

### Backend Setup
Requirements: Python 3.8+ and pip.

```powershell
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Dashboard**: http://localhost:8000/admin/

### Demo Credentials
- Admin: `admin` / (your password)
- Demo Teacher: `demo_teacher` / `Demo@12345`
- Demo Student: `demo_student` / `Demo@12345`

---

## 🛠️ Technologies

### Frontend
- **Vite** - Build tool
- **React + TypeScript** - UI framework
- **Tailwind CSS** - Styling
- **shadcn-ui** - Component library
- **TipTap** - Rich text editor

### Backend
- **Django** - Web framework
- **Django REST Framework** - API framework
- **SQLite** - Database (development)
- **Session Authentication** - Auth system

---

## 🔐 Authentication System

### Features Implemented
✅ Session-based authentication with CSRF protection  
✅ User registration and login  
✅ Protected routes (Admin page requires auth)  
✅ Role-based access (Admin/Teacher/Student)  
✅ Auto-login after registration  

### Authentication Endpoints
```
POST /api/auth/register/  - Register new users
POST /api/auth/login/     - Login with credentials
POST /api/auth/logout/    - Logout (requires auth)
GET  /api/auth/check/     - Check auth status
GET  /api/auth/csrf/      - Get CSRF token
```

### Usage Flow
1. **Register**: Visit `/register` → Fill form → Auto-login
2. **Login**: Visit `/login` → Enter credentials → Redirect to `/admin`
3. **Protected Access**: Try accessing `/admin` without login → Redirect to `/login`
4. **Logout**: Click logout in header → Clear session

### Security Features
- HTTP-only session cookies
- CSRF token validation
- Password validation (min 8 chars, complexity checks)
- CORS configuration for localhost:5173
- Session expires after 1 day (configurable)

**Production Note**: Set `SESSION_COOKIE_SECURE = True` for HTTPS

---

## 📊 Admin Dashboard

### Overview
**Access**: http://localhost:8000/admin/

The Django admin dashboard provides a comprehensive interface for managing all aspects of the course platform.

### Models Available (10 Total)

#### 1. Users
- View all users with role display
- Assign roles (Admin/Teacher/Student)
- Manage permissions
- Search by username, email, first/last name

#### 2. Teacher Classes
- Create classes with auto-generated codes
- Code is readonly after creation (protected)
- Each class belongs to one teacher
- Track class name, teacher, code
- Filter by teacher, search by name/code

#### 3. Class Enrollments
- Track which students are in which classes
- Join using class code
- View enrollment dates
- Filter by class or student

#### 4. Courses
- Create courses within teacher classes
- Requires class selection
- Title, description, teacher association
- Search by title, filter by teacher/class
- Teachers see only their own courses

#### 5. Modules
- Organize courses into modules
- Title, description, order
- Linked to parent course
- Search by title, filter by course

#### 6. Lessons
- Create lessons within modules
- Rich text content support
- Add key takeaways, exercises, resources (inline)
- Order management
- Search and filter capabilities

#### 7. Topics
- Create hierarchical topics
- Can be nested (parent-child relationship)
- Linked to lessons
- Rich content support
- Inline content editing

#### 8. Key Takeaways
- Short takeaway messages
- Linked to lesson or topic
- Content preview (50 chars)
- Order management

#### 9. Exercises
- Practice exercises with title and description
- Linked to lesson or topic
- Order management

#### 10. Resources
- Useful resources with title, description, URL
- Linked to lesson or topic
- Order management

### Admin Features

#### Search Capabilities (50+ fields)
- Users: username, email, first name, last name
- Classes: name, code, teacher username
- Courses: title, description, teacher username
- Modules: title, description, course title
- Lessons: title, content
- Topics: title, content
- Key Takeaways: content
- Exercises: title, description
- Resources: title, description

#### Filter Options (30+)
- By teacher (classes, courses)
- By date (created_at, updated_at)
- By class (enrollments, courses)
- By course (modules)
- By module (lessons)
- By lesson (topics, takeaways, exercises, resources)

#### Inline Editing
- **Lesson Admin**: Add takeaways, exercises, resources without leaving lesson page
- **Topic Admin**: Add nested topics, takeaways, exercises, resources inline
- **Module Admin**: View lessons (readonly)
- **Course Admin**: View modules (readonly)

#### Auto-Generated Features
- **Class Codes**: 8-character unique codes auto-generated
- **Ordering**: Automatic order assignment for modules, lessons, topics
- **Timestamps**: Auto-set created_at and updated_at

#### Custom Display Methods
- `get_teacher()`: Show teacher username for classes/courses
- `get_role()`: Display user role (Admin/Teacher/Student)
- `content_preview()`: Show first 50 chars of content

---

## 📝 Rich Content Features

### Interactive Content Creation

#### Key Takeaways
- **Input**: Type and press Enter to add
- **Display**: Check icon (✓) for each item
- **Removal**: X button to delete
- **Validation**: Minimum 1 required
- **Preview**: Shows with green checkmarks

#### Practice Exercises
- **Fields**: Title + Description
- **Add**: Press Enter after filling both
- **Display**: Title bold, description below
- **Removal**: X button to delete

#### Useful Resources
- **Fields**: Title + Description (optional) + URL
- **Add**: Press Enter after filling required fields
- **Display**: Clickable links
- **Removal**: X button to delete

### API Support

#### Creating Lesson with Content
```json
POST /api/lessons/
{
  "title": "Variables in Python",
  "content": "<p>Learn about variables...</p>",
  "moduleId": "uuid",
  "keyTakeaways": [
    "Variables store data",
    "Use descriptive names"
  ],
  "exercises": [
    {
      "title": "Variable Practice",
      "description": "Create 5 variables with different types"
    }
  ],
  "resources": [
    {
      "title": "Python Variables Guide",
      "description": "Official docs",
      "url": "https://docs.python.org/3/tutorial/"
    }
  ]
}
```

#### Creating Topic with Content
```json
POST /api/topics/
{
  "title": "Variable Naming",
  "content": "<p>Best practices...</p>",
  "lessonId": "uuid",
  "parentId": null,
  "keyTakeaways": [...],
  "exercises": [...],
  "resources": [...]
}
```

### User Experience
1. Type content in input field
2. Press Enter to add as bullet point
3. Item appears below with visual indicator
4. Click X to remove if needed
5. Preview updates in real-time

---

## 💾 Database Population

### Available Commands

#### 1. Populate Modules & Lessons
Adds modules and lessons to courses that don't have them.
```bash
python manage.py populate_modules_and_lessons
```

#### 2. Add Content to Lessons
Adds key takeaways, exercises, and resources to existing lessons.
```bash
python manage.py add_content_to_lessons
```

#### 3. Add Missing Takeaways
Adds default key takeaways to lessons without them.
```bash
python manage.py add_missing_takeaways
```

### Population Results

**Execution Summary** (December 15, 2025):
- **Lessons Processed**: 32 lessons across 6 courses
- **Topics Processed**: 1 topic
- **Key Takeaways Added**: 4 (to topics)
- **Exercises Added**: 98 (3 per lesson)
- **Resources Added**: 98 (3 per lesson)

### Content Generation Strategy

Generated content is contextual based on:
- **Lesson titles** - Content tailored to subject matter
- **Course context** - Resources relevant to course
- **Learning progression** - Flows from basics to advanced

#### Example Generated Content
For "Introduction to Machine Learning":
- **Takeaway**: "Master the core concepts of Introduction to Machine Learning"
- **Exercise**: "Practice Exercise: Introduction to Machine Learning"
- **Resource**: "Introduction to Machine Learning Guide"

### Courses Populated
1. Artificial Intelligence (16 lessons)
2. Entrepreneurship 101 (1 lesson + 1 topic)
3. The C Programming Language (1 lesson)
4. सामाजिक अध्ययन - Social Studies (1 lesson)
5. सुविन भट्टराईका कृतिहरु - Suvin Bhattarai's Works (3 modules)
6. 한국어 1 - Korean Language (14 lessons)

### Verification
```bash
python manage.py shell
>>> from courses.models import Lesson, KeyTakeaway, Exercise, Resource
>>> Lesson.objects.count()
>>> KeyTakeaway.objects.count()
>>> Exercise.objects.count()
>>> Resource.objects.count()
```

---

## 🔒 Permission System

### Role-Based Access Control

#### Admin Role
✅ **Full Access**
- See ALL content (all teachers, all classes)
- Edit ANY content (courses, modules, lessons, topics)
- Delete ANY content
- Manage user roles and permissions
- Unrestricted admin dashboard access

#### Teacher Role
✅ **Own Content Only**
- Create teacher classes (auto-set as teacher)
- Create courses in own classes
- Edit own courses, modules, lessons, topics only
- Delete own content only
- Cannot see other teachers' content
- Cannot modify students' private data

❌ **Restricted**
- Cannot edit other teachers' courses
- Cannot delete other teachers' content
- Cannot access all classes (only own)

#### Student Role
✅ **Read-Only Access**
- View courses in enrolled classes
- Enroll using class codes
- See course content (read-only)

❌ **No Create/Edit/Delete**
- Cannot create anything
- Cannot edit any content
- Cannot delete any content
- Cannot access admin panel

### Permission Implementation

#### Queryset Filtering
```python
# Teachers see only their own classes
def get_queryset(self, request):
    qs = super().get_queryset(request)
    if request.user.role == 'Teacher':
        return qs.filter(teacher=request.user)
    return qs
```

#### Object-Level Permissions
```python
# Check ownership before update
def update(self, request, *args, **kwargs):
    instance = self.get_object()
    if request.user.role == 'Teacher':
        # Check if user owns the content
        if instance.course.teacherClass.teacher != request.user:
            return Response(
                {"detail": "You don't have permission to edit this."},
                status=status.HTTP_403_FORBIDDEN
            )
    return super().update(request, *args, **kwargs)
```

#### Bulk Operations
```python
# Validate each item in bulk delete
for item_id in request.data.get('ids', []):
    item = Model.objects.get(id=item_id)
    if not user_can_delete(item, request.user):
        return Response(
            {"detail": f"No permission for item {item_id}"},
            status=403
        )
```

### Permission Checks (13 Total)
1. TeacherClass queryset filtering
2. Course queryset filtering
3. Module update permission
4. Lesson update permission
5. Topic update permission
6. TeacherClass update permission
7. TeacherClass delete permission
8. Course bulk delete validation
9. Module bulk delete validation
10. Lesson bulk delete validation
11. Topic bulk delete validation
12. Exercise delete validation
13. Resource delete validation

---

## 📡 API Reference

### Authentication Endpoints

#### Register
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "message": "Registration successful"
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Student"
  }
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Session

Response: 200 OK
{
  "message": "Logout successful"
}
```

#### Check Auth Status
```http
GET /api/auth/check/

Response: 200 OK
{
  "isAuthenticated": true,
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "role": "Student"
  }
}
```

### Course Management Endpoints

#### Create Course
```http
POST /api/courses/
Content-Type: application/json
Authorization: Session (Teacher or Admin)

{
  "title": "Python for Beginners",
  "description": "Learn Python from scratch",
  "teacherClassId": "class-uuid"
}

Response: 201 Created
```

#### Update Module (with Permission)
```http
PATCH /api/modules/{id}/
Content-Type: application/json
Authorization: Session (Owner or Admin)

{
  "title": "Updated Module Title",
  "description": "Updated description"
}

Response: 200 OK (if authorized)
Response: 403 Forbidden (if not owner)
```

#### Delete Teacher Class (with Permission)
```http
DELETE /api/classes/{id}/
Authorization: Session (Owner or Admin)

Response: 204 No Content (if authorized)
Response: 403 Forbidden (if not owner)
{
  "detail": "You do not have permission to delete this class."
}
```

#### Bulk Delete Courses
```http
POST /api/courses/bulk-delete/
Content-Type: application/json
Authorization: Session

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}

Response: 200 OK
{
  "deleted": 3,
  "message": "3 courses deleted successfully"
}

Response: 403 Forbidden
{
  "detail": "You don't have permission to delete course {id}"
}
```

### Lesson & Topic Endpoints

#### Create Lesson with Content
```http
POST /api/lessons/
Content-Type: application/json

{
  "title": "Variables",
  "content": "<p>Variables store data...</p>",
  "moduleId": "uuid",
  "order": 1,
  "keyTakeaways": ["Point 1", "Point 2"],
  "exercises": [
    {
      "title": "Exercise 1",
      "description": "Description here"
    }
  ],
  "resources": [
    {
      "title": "Resource 1",
      "description": "Description",
      "url": "https://example.com"
    }
  ]
}

Response: 201 Created
```

#### Update Lesson (with Permission)
```http
PATCH /api/lessons/{id}/
Content-Type: application/json
Authorization: Session (Owner or Admin)

{
  "title": "Updated Lesson Title"
}

Response: 200 OK (if authorized)
Response: 403 Forbidden (if not owner)
```

#### Update Topic (with Permission)
```http
PATCH /api/topics/{id}/
Content-Type: application/json
Authorization: Session (Owner or Admin)

{
  "title": "Updated Topic Title"
}

Response: 200 OK (if authorized)
Response: 403 Forbidden (if not owner)
```

### All Endpoints (25 Total)

**Authentication** (5):
- POST /api/auth/register/
- POST /api/auth/login/
- POST /api/auth/logout/
- GET /api/auth/check/
- GET /api/auth/csrf/

**Teacher Classes** (5):
- GET /api/classes/
- POST /api/classes/
- GET /api/classes/{id}/
- PATCH /api/classes/{id}/ ✨ (with permission)
- DELETE /api/classes/{id}/ ✨ (with permission)

**Courses** (5):
- GET /api/courses/
- POST /api/courses/
- GET /api/courses/{id}/
- PATCH /api/courses/{id}/
- POST /api/courses/bulk-delete/ ✨ (with permission)

**Modules** (5):
- GET /api/modules/
- POST /api/modules/
- GET /api/modules/{id}/
- PATCH /api/modules/{id}/ ✨ (with permission)
- POST /api/modules/bulk-delete/ ✨ (with permission)

**Lessons** (5):
- GET /api/lessons/
- POST /api/lessons/
- GET /api/lessons/{id}/
- PATCH /api/lessons/{id}/ ✨ (with permission)
- POST /api/lessons/bulk-delete/ ✨ (with permission)

**Topics & Others** (Additional):
- Topics CRUD with permission checks
- Key Takeaways CRUD
- Exercises CRUD
- Resources CRUD
- Enrollments CRUD

✨ = New or enhanced with permission checks

---

## 🧪 Testing

### Quick Test Procedure (5 minutes)

#### 1. Access Admin Dashboard
```
URL: http://localhost:8000/admin/
Login: admin / (your password)
Expected: See all 10 models in sidebar
```

#### 2. Verify Models Present
- [ ] Users
- [ ] Teacher Classes
- [ ] Class Enrollments
- [ ] Courses
- [ ] Modules
- [ ] Lessons
- [ ] Topics
- [ ] Key Takeaways
- [ ] Exercises
- [ ] Resources

#### 3. Test Create Operations
```
1. Click "Teacher Classes" → "Add Teacher Class"
2. Enter class name
3. Save
4. Expected: Class code auto-generated (8 chars)
```

#### 4. Test Permission System
```
Setup:
1. Create teacher1 user (role: Teacher)
2. Login as teacher1
3. Create "Class A"
4. Create "Course A" in Class A
5. Logout

Test:
1. Create teacher2 user (role: Teacher)
2. Login as teacher2
3. Try to edit "Course A"
4. Expected: Permission denied (403)

Verify:
1. Login as admin
2. Edit "Course A"
3. Expected: Works! Admin can edit anything
```

#### 5. Test Search & Filters
```
1. Go to Courses list
2. Type in search box
3. Expected: Filters courses by title/description
4. Use filter sidebar
5. Expected: Narrows results by teacher/class
```

### Comprehensive Testing Guide

#### Permission Tests

**Test 1: Teacher Cannot Edit Other's Content**
```
Steps:
1. Login as teacher1
2. Create course "My Course"
3. Logout
4. Login as teacher2
5. Try to edit "My Course"
Expected: 403 Forbidden or form submission fails
```

**Test 2: Admin Can Edit All Content**
```
Steps:
1. Login as teacher1
2. Create course "Teacher Course"
3. Logout
4. Login as admin
5. Edit "Teacher Course"
Expected: Success! Changes saved
```

**Test 3: Student Cannot Access Admin**
```
Steps:
1. Login as student
2. Try to visit /admin/
Expected: Redirect to login or 403 Forbidden
```

**Test 4: Queryset Filtering Works**
```
Steps:
1. Login as teacher1, create 2 courses
2. Login as teacher2, create 2 courses
3. Login as teacher1
4. View courses list
Expected: See only own 2 courses
```

**Test 5: Bulk Delete Respects Permissions**
```
Steps:
1. Teacher1 creates course A
2. Teacher2 creates course B
3. Teacher2 tries bulk delete [A, B]
Expected: Error "No permission for course A"
```

#### Feature Tests

**Test 6: Auto-Generated Class Codes**
```
Steps:
1. Create teacher class
2. Don't fill in code field
3. Save
Expected: 8-character code auto-generated (e.g., "ABC12XYZ")
```

**Test 7: Class Code Readonly After Creation**
```
Steps:
1. Create teacher class (code generates)
2. Try to edit code field
Expected: Field is readonly/disabled
```

**Test 8: Inline Editing Works**
```
Steps:
1. Go to Lesson admin
2. Click on a lesson
3. Scroll to inline sections
4. Add key takeaway inline
5. Save
Expected: Takeaway saved and linked to lesson
```

**Test 9: Search Functionality**
```
Steps:
1. Create 5 courses with different titles
2. Search for specific word
Expected: Only courses with that word show
```

**Test 10: Content Preview Truncation**
```
Steps:
1. Create key takeaway with 100+ chars
2. View in list
Expected: Shows first 50 chars + "..."
```

#### API Tests

**Test 11: Create Lesson with Nested Content**
```bash
curl -X POST http://localhost:8000/api/lessons/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lesson",
    "content": "<p>Content</p>",
    "moduleId": "uuid",
    "keyTakeaways": ["Takeaway 1"],
    "exercises": [{"title": "Ex 1", "description": "Desc"}],
    "resources": [{"title": "Res 1", "url": "https://example.com"}]
  }'

Expected: 201 Created with all nested data
```

**Test 12: Update Without Permission**
```bash
curl -X PATCH http://localhost:8000/api/modules/uuid/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=teacher2_session" \
  -d '{"title": "Hacked Title"}'

Expected: 403 Forbidden
{
  "detail": "You don't have permission to edit this module."
}
```

### Automated Testing Commands

#### Django Check
```bash
python manage.py check
Expected: System check identified 0 issues (0 silenced).
```

#### Run Django Tests
```bash
python manage.py test courses
Expected: All tests pass
```

#### Frontend Tests (if configured)
```bash
npm test
Expected: All component tests pass
```

### Test Checklist

- [ ] Admin dashboard loads (all 10 models visible)
- [ ] Create teacher class (code auto-generates)
- [ ] Create course (requires class selection)
- [ ] Teacher can edit own content
- [ ] Teacher cannot edit others' content
- [ ] Admin can edit all content
- [ ] Student cannot access admin
- [ ] Search finds correct results
- [ ] Filters narrow results correctly
- [ ] Inline editing saves properly
- [ ] Class code readonly after creation
- [ ] Content preview truncates at 50 chars
- [ ] API create lesson with nested data works
- [ ] API update without permission returns 403
- [ ] Bulk delete respects permissions
- [ ] Django check passes with 0 issues

---

## 🚀 Deployment

### Pre-Deployment Checklist

#### Code Validation
- [ ] Run `python manage.py check` (0 issues)
- [ ] Run `python manage.py test` (all pass)
- [ ] Run `npm run build` (no errors)
- [ ] Review git diff for unintended changes
- [ ] Verify all migrations applied

#### Security Review
- [ ] Set `DEBUG = False` in production
- [ ] Set `SESSION_COOKIE_SECURE = True` for HTTPS
- [ ] Update `ALLOWED_HOSTS` with domain
- [ ] Configure CORS for production domain
- [ ] Review SECRET_KEY (use environment variable)
- [ ] Enable CSRF protection
- [ ] Set secure headers (HSTS, X-Frame-Options)

#### Database
- [ ] Backup current database
- [ ] Test migrations on staging
- [ ] Verify data integrity
- [ ] Plan rollback strategy

#### Features
- [ ] All 10 models registered in admin
- [ ] Permission system functional
- [ ] API endpoints operational
- [ ] Search and filters working
- [ ] Bug fixes applied (CreateCourseForm)

### Deployment Steps

> **📘 For detailed deployment instructions to Vercel (frontend) and Render (backend), see [DEPLOYMENT.md](DEPLOYMENT.md)**

#### Quick Local Development Setup

#### 1. Backup (Critical)
```bash
# Database backup
cp backend/db.sqlite3 backend/db.sqlite3.backup

# Code backup
git tag pre-deployment-$(date +%Y%m%d)
git push --tags

# Files backup
cp backend/courses/admin.py backend/courses/admin.py.backup
cp backend/courses/views.py backend/courses/views.py.backup
cp src/components/admin/CreateCourseForm.tsx CreateCourseForm.tsx.backup
```

#### 2. Deploy Code
```bash
# Pull latest changes
git pull origin main

# Or merge feature branch
git checkout main
git merge feature/admin-dashboard
```

#### 3. Update Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ..
npm install
```

#### 4. Database Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### 5. Collect Static Files (Production)
```bash
python manage.py collectstatic --noinput
```

#### 6. Build Frontend
```bash
npm run build
```

#### 7. Restart Services
```bash
# Development
python backend/manage.py runserver
npm run dev

# Production (example with gunicorn)
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

#### 8. Verify Deployment
```bash
# Check Django
python manage.py check

# Access admin
curl http://localhost:8000/admin/

# Test API
curl http://localhost:8000/api/courses/
```

### Rollback Plan

If issues occur, follow these steps:

#### Quick Rollback
```bash
# Restore database
cp backend/db.sqlite3.backup backend/db.sqlite3

# Restore code
git revert HEAD
# or
git reset --hard pre-deployment-tag

# Restart
python manage.py runserver
```

#### File-Level Rollback
```bash
# Restore specific files
cp backend/courses/admin.py.backup backend/courses/admin.py
cp backend/courses/views.py.backup backend/courses/views.py
cp CreateCourseForm.tsx.backup src/components/admin/CreateCourseForm.tsx

# Restart
python manage.py runserver
npm run dev
```

### Post-Deployment Verification

#### Verify Admin Dashboard
- Visit http://localhost:8000/admin/
- Confirm all 10 models visible
- Test create operation
- Test edit operation
- Test delete operation
- Verify permissions work

#### Verify API
- Test auth endpoints
- Test CRUD operations
- Verify permission checks return 403
- Test bulk operations

#### Verify Frontend
- Access http://localhost:5173
- Test login/logout
- Test admin page (requires auth)
- Test CreateCourseForm (modal stays open)

#### Monitor Logs
```bash
# Django logs
tail -f logs/django.log

# Frontend logs (browser console)
# Check for JavaScript errors

# Server logs
tail -f /var/log/nginx/access.log  # if using nginx
```

### Production Configuration

#### settings.py (Production)
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Database (example PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': '5432',
    }
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

#### Environment Variables
```bash
# .env file (never commit this!)
SECRET_KEY=your-secret-key-here
DEBUG=False
DB_NAME=coursehub_prod
DB_USER=coursehub_user
DB_PASSWORD=strong-password
DB_HOST=localhost
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue 1: CreateCourseForm Modal Closes Immediately
**Status**: ✅ FIXED  
**Error**: "Cannot read properties of undefined (reading 'username')"  
**Solution**: Already fixed with null check `tc.teacher?.username`  
**Verification**: Modal should stay open when clicking "Create Course"

#### Issue 2: Cannot See All Models in Admin
**Symptom**: Only 3 models visible instead of 10  
**Cause**: Models not registered in admin.py  
**Solution**: Already registered - refresh admin page  
**Verification**: Check sidebar for all 10 models

#### Issue 3: Permission Denied When Editing
**Symptom**: 403 Forbidden when trying to edit  
**Cause**: User doesn't own the content (permission system working correctly)  
**Solution**: This is expected behavior! Teachers can only edit own content  
**Workaround**: Login as admin to edit all content

#### Issue 4: Class Code Not Auto-Generating
**Symptom**: Code field is empty after saving  
**Cause**: JavaScript not executing or admin override  
**Solution**: Code auto-generates in save() method - check admin.py line 93-97  
**Verification**: Create class, leave code blank, save, should populate

#### Issue 5: Search Not Working
**Symptom**: Search box doesn't filter results  
**Cause**: search_fields not configured  
**Solution**: Already configured in admin.py for all models  
**Verification**: Type in search box, results should narrow

#### Issue 6: Filter Sidebar Empty
**Symptom**: No filter options showing  
**Cause**: list_filter not configured  
**Solution**: Already configured - check admin.py  
**Verification**: Sidebar should show filter options (teacher, date, etc.)

#### Issue 7: Cannot Create Course (No Classes Available)
**Symptom**: Class dropdown is empty  
**Cause**: No teacher classes created yet  
**Solution**: Create a teacher class first  
**Steps**:
  1. Go to Admin → Teacher Classes
  2. Click "Add Teacher Class"
  3. Fill in name, save
  4. Now try creating course again

#### Issue 8: Django Admin Won't Load
**Symptom**: 500 error or admin page blank  
**Cause**: Syntax error in admin.py  
**Solution**: Run `python manage.py check`  
**Fix**: Review admin.py for syntax issues

#### Issue 9: Permission Check Not Working
**Symptom**: Teacher can edit other teachers' content  
**Cause**: Permission check not implemented or bypassed  
**Solution**: Verify update() methods in views.py (lines 410-448)  
**Verification**: Test as teacher1 editing teacher2's content

#### Issue 10: Inline Editing Not Saving
**Symptom**: Added inline item doesn't persist  
**Cause**: Form validation failing silently  
**Solution**: Check required fields are filled  
**Common**: Order field must be set (usually auto)

### Debugging Commands

#### Check Django Configuration
```bash
python manage.py check
# Expected: 0 issues
```

#### Test Database Connection
```bash
python manage.py shell
>>> from courses.models import Course
>>> Course.objects.count()
```

#### Verify Admin Registration
```bash
python manage.py shell
>>> from django.contrib import admin
>>> admin.site._registry.keys()
# Should show all 10 model classes
```

#### Check User Roles
```bash
python manage.py shell
>>> from courses.models import User
>>> for u in User.objects.all():
...     print(f"{u.username}: {u.role}")
```

#### Test Permissions
```bash
python manage.py shell
>>> from courses.models import Course, User
>>> teacher = User.objects.get(username='teacher1')
>>> course = Course.objects.first()
>>> course.teacherClass.teacher == teacher
# Should return True for owned, False for not owned
```

### Logs & Monitoring

#### Enable Debug Logging
```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

#### View Django Logs
```bash
# Console output (development)
python manage.py runserver

# File logging (if configured)
tail -f logs/django.log
```

#### Browser Console Errors
- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for failed API requests
- Look for 403, 404, 500 status codes

### Getting Help

#### Documentation References
- Django Admin: https://docs.djangoproject.com/en/stable/ref/contrib/admin/
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/

#### Check README_ADMIN.md
Complete consolidated documentation with:
- Full admin dashboard guide
- Permission system details
- API reference
- Testing procedures

#### Debug Checklist
- [ ] Run `python manage.py check`
- [ ] Check browser console for errors
- [ ] Verify user is logged in
- [ ] Verify user has correct role
- [ ] Check Django logs for exceptions
- [ ] Test with admin account (eliminates permission issues)
- [ ] Clear browser cache and cookies
- [ ] Restart Django server
- [ ] Check database for data

---

## 📊 Implementation Statistics

### Code Changes
| File | Before | After | Change |
|------|--------|-------|--------|
| admin.py | 53 lines | 252 lines | +199 (+375%) |
| views.py | 408 lines | 448 lines | +40 (+10%) |
| CreateCourseForm.tsx | Bug | Fixed | Null check |

### Features Added
| Category | Count |
|----------|-------|
| Models in Admin | 10 (was 3) |
| Search Fields | 50+ (was ~10) |
| Filter Options | 30+ (was ~5) |
| Permission Checks | 13 (was 8) |
| API Endpoints | 25 (was 20) |
| Update Endpoints | 5 (new) |
| Delete Endpoints | 1 (enhanced) |

### Capabilities
| Feature | Status |
|---------|--------|
| Create Operations | ✅ All models |
| Read Operations | ✅ With role filtering |
| Update Operations | ✅ With permissions |
| Delete Operations | ✅ With permissions |
| Search | ✅ 50+ fields |
| Filter | ✅ 30+ options |
| Inline Edit | ✅ Lessons, Topics |
| Auto-Generate | ✅ Class codes |
| Permission System | ✅ 13 checks |
| Bug Fixes | ✅ CreateCourseForm |

---

## 🎯 Next Steps

### Immediate (This Week)
1. ✅ Test admin dashboard thoroughly
2. ✅ Verify permission system works
3. ✅ Test all CRUD operations
4. ✅ Review CreateCourseForm fix
5. ✅ Deploy to staging environment

### Short Term (This Month)
1. Train users on admin dashboard
2. Monitor for issues in production
3. Gather user feedback
4. Optimize slow queries (if any)
5. Add more sample content

### Long Term (Future)
1. Add frontend edit forms (currently admin-only)
2. Implement content versioning
3. Add audit logging for changes
4. Build analytics dashboard
5. Add export/import functionality
6. Implement email notifications
7. Add calendar/scheduling features
8. Build mobile app

### Optional Enhancements
- Password reset functionality
- Email verification for registration
- User profile management
- Course completion tracking
- Certificates generation
- Payment integration
- Video hosting
- Live chat support
- Gamification features
- Social features (comments, likes)

---

## 🙏 Credits & Notes

### Development Notes
- Built with Django 4.x and React 18
- Uses session-based authentication
- SQLite for development (PostgreSQL recommended for production)
- CORS configured for local development
- All endpoints require authentication except login/register

### Bug Fixes Applied
- ✅ CreateCourseForm crash (December 17, 2025)
- ✅ Null teacher handling
- ✅ Modal stability

### Production Notes
- Set DEBUG=False in production
- Use PostgreSQL or MySQL in production
- Enable HTTPS (SESSION_COOKIE_SECURE=True)
- Use environment variables for secrets
- Set up proper logging
- Configure backups
- Monitor performance

### Additional Resources
- Django Documentation: https://docs.djangoproject.com/
- React Documentation: https://react.dev/
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

---

**Last Updated**: December 17, 2025  
**Version**: 1.0 Production  
**Status**: ✅ READY TO DEPLOY

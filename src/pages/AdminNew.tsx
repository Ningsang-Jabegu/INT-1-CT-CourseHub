import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { CreateCourseForm } from "@/components/admin/CreateCourseForm";
import { CreateModuleForm } from "@/components/admin/CreateModuleForm";
import { CreateLessonForm } from "@/components/admin/CreateLessonForm";
import { CreateTopicForm } from "@/components/admin/CreateTopicForm";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useCourseContext } from "@/context/CourseContext";
import { Settings, Plus, BookOpen, Users as UsersIcon, Activity, HardDrive, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, NewUserInput } from "@/types/auth";
import { TeacherClass } from "@/types/course";
import { 
  fetchUsers, 
  createUserAdmin, 
  updateUserAdmin,
  bulkDeleteUsers,
  bulkDeleteCourses,
  bulkDeleteModules,
  bulkDeleteLessons,
  bulkDeleteTopics,
  deleteCourse,
  deleteModule,
  deleteLesson,
  deleteTopic,
  deleteClass,
  updateCourse,
  updateModule,
  updateLesson,
  updateTopic,
} from "@/lib/api";
import api from "@/lib/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

type AdminSection = "classes" | "courses" | "lessons" | "modules" | "topics";

const AdminNew = () => {
  const { courses } = useCourseContext();
  const [adminSection, setAdminSection] = useState<AdminSection>("classes");

  const { isOpen: confirmOpen, isLoading: confirmLoading, options: confirmOptions, confirm: showConfirm, handleConfirm, handleCancel } = useConfirmDialog();

  const initialUserForm: NewUserInput = {
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "student",
    is_staff: false,
    password_auth_enabled: true,
    password: "",
  };

  const pageSize = 10;

  // Dialog states
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [showAddModuleDialog, setShowAddModuleDialog] = useState(false);
  const [showAddLessonDialog, setShowAddLessonDialog] = useState(false);
  const [showAddTopicDialog, setShowAddTopicDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);

  // Multi-select states
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // Editing states
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [editingClass, setEditingClass] = useState<any>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [adminPage, setAdminPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [creatingUser, setCreatingUser] = useState(false);
  const [addingAnother, setAddingAnother] = useState(false);
  const [pwd2, setPwd2] = useState("");
  const [userForm, setUserForm] = useState<NewUserInput>(initialUserForm);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Classes state
  const [classes, setClasses] = useState<TeacherClass[]>([]);

  // Computed values
  const usersCount = users.length;
  const isEditingUser = Boolean(editingUser);

  const admins = useMemo(() => users.filter((u) => u.role === "admin"), [users]);
  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);
  const students = useMemo(() => users.filter((u) => u.role === "student"), [users]);

  const adminTotalPages = Math.max(1, Math.ceil(admins.length / pageSize));
  const teacherTotalPages = Math.max(1, Math.ceil(teachers.length / pageSize));
  const studentTotalPages = Math.max(1, Math.ceil(students.length / pageSize));

  const paginatedAdmins = useMemo(() => admins.slice((adminPage - 1) * pageSize, adminPage * pageSize), [admins, adminPage]);
  const paginatedTeachers = useMemo(() => teachers.slice((teacherPage - 1) * pageSize, teacherPage * pageSize), [teachers, teacherPage]);
  const paginatedStudents = useMemo(() => students.slice((studentPage - 1) * pageSize, studentPage * pageSize), [students, studentPage]);

  const allCourses = courses;
  const allCoursesSelected = allCourses.length > 0 && selectedCourseIds.length === allCourses.length;

  const allModules = courses.flatMap((c) => c.modules);
  const allModulesSelected = allModules.length > 0 && selectedModuleIds.length === allModules.length;

  const allLessons = courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
  const allLessonsSelected = allLessons.length > 0 && selectedLessonIds.length === allLessons.length;

  const allTopics = courses.flatMap((c) => c.modules.flatMap((m) => m.lessons.flatMap((l) => l.topics)));
  const allTopicsSelected = allTopics.length > 0 && selectedTopicIds.length === allTopics.length;

  // Load users
  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to fetch users", variant: "destructive" });
    }
  };

  // Load classes
  const loadClasses = async () => {
    try {
      const response = await api.get("/classes/");
      setClasses(response.data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to fetch classes", variant: "destructive" });
    }
  };

  const resetUserFormState = () => {
    setUserForm(initialUserForm);
    setPwd2("");
    setEditingUser(null);
    setCreatingUser(false);
    setAddingAnother(false);
  };

  const openAddUserModal = () => {
    resetUserFormState();
    setShowAddUserDialog(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: (user.role as NewUserInput["role"]) || "student",
      is_staff: !!user.is_staff,
      password_auth_enabled: user.password_auth_enabled !== false,
      password: "",
    });
    setPwd2("");
    setShowAddUserDialog(true);
  };

  useEffect(() => {
    loadUsers();
    loadClasses();
  }, []);

  useEffect(() => {
    if (adminPage > adminTotalPages) setAdminPage(adminTotalPages);
  }, [adminPage, adminTotalPages]);

  useEffect(() => {
    if (teacherPage > teacherTotalPages) setTeacherPage(teacherTotalPages);
  }, [teacherPage, teacherTotalPages]);

  useEffect(() => {
    if (studentPage > studentTotalPages) setStudentPage(studentTotalPages);
  }, [studentPage, studentTotalPages]);

  // User handlers by role
  const allAdminsSelected = admins.length > 0 && selectedAdminIds.length === admins.length;
  const allTeachersSelected = teachers.length > 0 && selectedTeacherIds.length === teachers.length;
  const allStudentsSelected = students.length > 0 && selectedStudentIds.length === students.length;

  const toggleSelectAdmin = (id: number) => {
    setSelectedAdminIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllAdmins = () => {
    if (allAdminsSelected) setSelectedAdminIds([]);
    else setSelectedAdminIds(admins.map((u) => u.id));
  };

  const toggleSelectTeacher = (id: number) => {
    setSelectedTeacherIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllTeachers = () => {
    if (allTeachersSelected) setSelectedTeacherIds([]);
    else setSelectedTeacherIds(teachers.map((u) => u.id));
  };

  const toggleSelectStudent = (id: number) => {
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllStudents = () => {
    if (allStudentsSelected) setSelectedStudentIds([]);
    else setSelectedStudentIds(students.map((u) => u.id));
  };

  // Course handlers
  const toggleSelectCourse = (id: string) => {
    setSelectedCourseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllCourses = () => {
    if (allCoursesSelected) setSelectedCourseIds([]);
    else setSelectedCourseIds(allCourses.map((c) => c.id));
  };

  // Module handlers
  const toggleSelectModule = (id: string) => {
    setSelectedModuleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllModules = () => {
    if (allModulesSelected) setSelectedModuleIds([]);
    else setSelectedModuleIds(allModules.map((m) => m.id));
  };

  // Lesson handlers
  const toggleSelectLesson = (id: string) => {
    setSelectedLessonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllLessons = () => {
    if (allLessonsSelected) setSelectedLessonIds([]);
    else setSelectedLessonIds(allLessons.map((l) => l.id));
  };

  // Topic handlers
  const toggleSelectTopic = (id: string) => {
    setSelectedTopicIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAllTopics = () => {
    if (allTopicsSelected) setSelectedTopicIds([]);
    else setSelectedTopicIds(allTopics.map((t) => t.id));
  };

  // Bulk delete handlers
  const handleBulkDeleteCourses = () => {
    if (selectedCourseIds.length === 0) return;
    showConfirm({
      title: `Delete ${selectedCourseIds.length} course(s)?`,
      description: `This action cannot be undone. You are about to permanently delete ${selectedCourseIds.length} course(s) and all their content. Are you sure?`,
      destructive: true,
      onConfirm: async () => {
        await bulkDeleteCourses(selectedCourseIds);
        setSelectedCourseIds([]);
        window.location.reload();
      },
    });
  };

  const handleBulkDeleteModules = () => {
    if (selectedModuleIds.length === 0) return;
    showConfirm({
      title: `Delete ${selectedModuleIds.length} module(s)?`,
      description: `This action cannot be undone. You are about to permanently delete ${selectedModuleIds.length} module(s) and all their content. Are you sure?`,
      destructive: true,
      onConfirm: async () => {
        await bulkDeleteModules(selectedModuleIds);
        setSelectedModuleIds([]);
        window.location.reload();
      },
    });
  };

  const handleBulkDeleteLessons = () => {
    if (selectedLessonIds.length === 0) return;
    showConfirm({
      title: `Delete ${selectedLessonIds.length} lesson(s)?`,
      description: `This action cannot be undone. You are about to permanently delete ${selectedLessonIds.length} lesson(s) and all their content. Are you sure?`,
      destructive: true,
      onConfirm: async () => {
        await bulkDeleteLessons(selectedLessonIds);
        setSelectedLessonIds([]);
        window.location.reload();
      },
    });
  };

  const handleBulkDeleteTopics = () => {
    if (selectedTopicIds.length === 0) return;
    showConfirm({
      title: `Delete ${selectedTopicIds.length} topic(s)?`,
      description: `This action cannot be undone. You are about to permanently delete ${selectedTopicIds.length} topic(s). Are you sure?`,
      destructive: true,
      onConfirm: async () => {
        await bulkDeleteTopics(selectedTopicIds);
        setSelectedTopicIds([]);
        window.location.reload();
      },
    });
  };

  const handleDeleteCourse = (id: string, title: string) => {
    showConfirm({
      title: `Delete course "${title}"?`,
      description: "This action cannot be undone. All modules, lessons, and topics in this course will be deleted permanently.",
      destructive: true,
      onConfirm: async () => {
        await deleteCourse(id);
        window.location.reload();
      },
    });
  };

  const handleDeleteModule = (id: string, title: string) => {
    showConfirm({
      title: `Delete module "${title}"?`,
      description: "This action cannot be undone. All lessons and topics in this module will be deleted permanently.",
      destructive: true,
      onConfirm: async () => {
        await deleteModule(id);
        window.location.reload();
      },
    });
  };

  const handleDeleteLesson = (id: string, title: string) => {
    showConfirm({
      title: `Delete lesson "${title}"?`,
      description: "This action cannot be undone. All topics and content in this lesson will be deleted permanently.",
      destructive: true,
      onConfirm: async () => {
        await deleteLesson(id);
        window.location.reload();
      },
    });
  };

  const handleDeleteTopic = (id: string, title: string) => {
    showConfirm({
      title: `Delete topic "${title}"?`,
      description: "This action cannot be undone. This topic and all its content will be deleted permanently.",
      destructive: true,
      onConfirm: async () => {
        await deleteTopic(id);
        window.location.reload();
      },
    });
  };

  const handleDeleteClass = (id: string, name: string) => {
    showConfirm({
      title: `Delete class "${name}"?`,
      description: "This action cannot be undone. All courses and student enrollments in this class will be deleted permanently.",
      destructive: true,
      onConfirm: async () => {
        await deleteClass(id);
        await loadClasses();
        window.location.reload();
      },
    });
  };

  const handleBulkDelete = async (ids: number[], reset: () => void, itemType: string) => {
    if (ids.length === 0) return;
    showConfirm({
      title: `Delete ${ids.length} ${itemType}(s)?`,
      description: `This action cannot be undone. You are about to permanently delete ${ids.length} ${itemType}(s). Are you sure?`,
      destructive: true,
      itemName: itemType,
      onConfirm: async () => {
        await bulkDeleteUsers(ids);
        reset();
        await loadUsers();
      },
    });
  };

  const handleBulkDeleteAdmins = () => handleBulkDelete(selectedAdminIds, () => setSelectedAdminIds([]), "admin");
  const handleBulkDeleteTeachers = () => handleBulkDelete(selectedTeacherIds, () => setSelectedTeacherIds([]), "teacher");
  const handleBulkDeleteStudents = () => handleBulkDelete(selectedStudentIds, () => setSelectedStudentIds([]), "student");

  const submitUserWithValidation = (mode: "save" | "save_add" | "save_continue") => {
    if (userForm.password_auth_enabled) {
      const passwordProvided = Boolean(userForm.password);
      const confirmationProvided = Boolean(pwd2);
      if (!isEditingUser || passwordProvided || confirmationProvided) {
        if ((userForm.password || "") !== (pwd2 || "")) {
          toast({ title: "Passwords do not match", variant: "destructive" });
          return;
        }
      }
    }
    handleSubmitUser(mode);
  };

  const handleSubmitUser = async (mode: "save" | "save_add" | "save_continue") => {
    try {
      setCreatingUser(true);

      const payload: Partial<NewUserInput> = {
        ...userForm,
      };

      // Avoid sending blank password on edit; let backend keep existing
      if (isEditingUser && !payload.password) {
        delete payload.password;
      }
      if (!payload.password_auth_enabled) {
        delete payload.password;
      }

      if (isEditingUser && editingUser) {
        await updateUserAdmin(editingUser.id, payload);
        toast({ title: "User updated" });
        await loadUsers();
        resetUserFormState();
        setShowAddUserDialog(false);
        return;
      }

      await createUserAdmin(payload as NewUserInput);
      await loadUsers();
      if (mode === "save") {
        setShowAddUserDialog(false);
        toast({ title: "User created" });
        resetUserFormState();
      } else if (mode === "save_add") {
        setAddingAnother(true);
        toast({ title: "Saved. Add another." });
        resetUserFormState();
        setTimeout(() => setAddingAnother(false), 200);
      } else {
        toast({ title: "Saved. Continue editing." });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? (isEditingUser ? "Failed to update user" : "Failed to create user"), variant: "destructive" });
    } finally {
      setCreatingUser(false);
    }
  };

  const renderUserTable = (
    title: string,
    rows: User[],
    paginatedRows: User[],
    selectedIds: number[],
    toggleSelect: (id: number) => void,
    toggleSelectAll: () => void,
    allSelected: boolean,
    page: number,
    setPage: (page: number) => void,
    totalPages: number,
    onDelete: () => void,
    onEdit: (user: User) => void,
  ) => (
    <Card key={title}>
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base mb-1">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{rows.length}</span>
            </p>
          </div>
          <Button variant="destructive" onClick={onDelete} disabled={selectedIds.length === 0} size="sm">
            Delete selected
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="max-h-[50vh] overflow-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-muted-foreground sticky top-0">
              <tr>
                <th className="p-2 w-10 text-left">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th className="p-2 text-left">Username</th>
                <th className="p-2 text-left">Full Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Staff Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((u) => (
                <tr key={u.id} className="border-t hover:bg-accent/50 transition-colors">
                  <td className="p-2">
                    <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} />
                  </td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name || u.last_name || "—"}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 capitalize">{u.role || "—"}</td>
                  <td className="p-2">{u.is_staff ? "Yes" : "No"}</td>
                  <td className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(u)}>Edit</Button>
                  </td>
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-muted-foreground" colSpan={6}>No users in this role.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-4">
            <Settings className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create and manage courses, modules, lessons, topics, and key takeaways.
          </p>
        </div>

        {/* Authentication & Authorization Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary" />
            Authentication & Authorization
          </h2>

          {/* Role Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.role === "admin").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.role === "teacher").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.role === "student").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Users Section Display - Always Visible */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">User Management</h3>
              <Button onClick={openAddUserModal}>
                <Plus className="h-4 w-4 mr-1" /> Add User
              </Button>
            </div>

            <div className="space-y-6">
              {renderUserTable(
                "Admins",
                admins,
                paginatedAdmins,
                selectedAdminIds,
                toggleSelectAdmin,
                toggleSelectAllAdmins,
                allAdminsSelected,
                adminPage,
                setAdminPage,
                adminTotalPages,
                handleBulkDeleteAdmins,
                openEditUserModal,
              )}
              {renderUserTable(
                "Teachers",
                teachers,
                paginatedTeachers,
                selectedTeacherIds,
                toggleSelectTeacher,
                toggleSelectAllTeachers,
                allTeachersSelected,
                teacherPage,
                setTeacherPage,
                teacherTotalPages,
                handleBulkDeleteTeachers,
                openEditUserModal,
              )}
              {renderUserTable(
                "Students",
                students,
                paginatedStudents,
                selectedStudentIds,
                toggleSelectStudent,
                toggleSelectAllStudents,
                allStudentsSelected,
                studentPage,
                setStudentPage,
                studentTotalPages,
                handleBulkDeleteStudents,
                openEditUserModal,
              )}
            </div>
          </div>
        </div>

        {/* Courses Management Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Courses Management
          </h2>
          {/* LMS health placeholders (wire to backend later) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">LMS Requests (24h)</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground mt-1">Hook up to ops metrics when available.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources Used</CardTitle>
                <HardDrive className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground mt-1">Bandwidth/CPU/DB units to be surfaced.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Server Balancing Type</CardTitle>
                <Share2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground mt-1">e.g., round robin / least connections.</p>
              </CardContent>
            </Card>
          </div>
          <div className="mb-6 flex items-center gap-1 border-b border-border">
            {(["classes", "courses", "modules", "lessons", "topics"] as AdminSection[]).map((section) => (
              <button
                key={section}
                onClick={() => setAdminSection(section)}
                className={`px-4 py-3 font-medium transition-colors capitalize ${
                  adminSection === section
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Section */}
        {adminSection === "classes" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Teacher Classes</h2>
            </div>
            {classes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic">
                    No classes created yet. Teachers can create classes from the Teacher Dashboard.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {classes.map((tc) => (
                  <Card key={tc.id} className="overflow-hidden">
                    <CardHeader className="bg-accent/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{tc.name}</CardTitle>
                          {tc.description && (
                            <p className="text-sm text-muted-foreground mt-1">{tc.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-md">
                            <code className="text-xs font-mono font-bold text-primary">{tc.classCode}</code>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditingClass(tc)}>Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClass(tc.id, tc.name)}>Delete</Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Teacher: {tc.teacherFirstName && tc.teacherLastName ? `${tc.teacherFirstName} ${tc.teacherLastName}` : 'N/A'} | Code: {tc.classCode}
                      </p>
                      {tc.duration && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {tc.duration}
                          {tc.start_date && tc.end_date && ` (${tc.start_date} to ${tc.end_date})`}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{tc.studentsCount}</div>
                          <div className="text-xs text-muted-foreground">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{tc.coursesCount}</div>
                          <div className="text-xs text-muted-foreground">Courses</div>
                        </div>
                        {tc.capacity && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{tc.capacity}</div>
                            <div className="text-xs text-muted-foreground">Capacity</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Courses Section */}
        {adminSection === "courses" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Courses</h2>
              <Button onClick={() => setShowAddCourseDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Course
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">All Courses</CardTitle>
                  <Button variant="destructive" onClick={handleBulkDeleteCourses} disabled={selectedCourseIds.length === 0}>
                    Delete selected
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-muted-foreground">
                      <tr>
                        <th className="p-2 w-10 text-left">
                          <input type="checkbox" checked={allCoursesSelected} onChange={toggleSelectAllCourses} />
                        </th>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Created At</th>
                        <th className="p-2 text-left">Updated At</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCourses.map((course) => (
                        <tr key={course.id} className="border-t">
                          <td className="p-2">
                            <input type="checkbox" checked={selectedCourseIds.includes(course.id)} onChange={() => toggleSelectCourse(course.id)} />
                          </td>
                          <td className="p-2">{course.title}</td>
                          <td className="p-2 text-xs text-muted-foreground">{new Date(course.createdAt).toLocaleDateString()}</td>
                          <td className="p-2 text-xs text-muted-foreground">{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "N/A"}</td>
                          <td className="p-2 flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditingCourse(course)}>Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCourse(course.id, course.title)}>Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modules Section */}
        {adminSection === "modules" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Modules</h2>
              <Button onClick={() => setShowAddModuleDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Module
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">All Modules</CardTitle>
                  <Button variant="destructive" onClick={handleBulkDeleteModules} disabled={selectedModuleIds.length === 0}>
                    Delete selected
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-muted-foreground">
                      <tr>
                        <th className="p-2 w-10 text-left">
                          <input type="checkbox" checked={allModulesSelected} onChange={toggleSelectAllModules} />
                        </th>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Course</th>
                        <th className="p-2 text-left">Order</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allModules.map((module) => {
                        const course = courses.find((c) => c.modules.find((m) => m.id === module.id));
                        return (
                          <tr key={module.id} className="border-t">
                            <td className="p-2">
                              <input type="checkbox" checked={selectedModuleIds.includes(module.id)} onChange={() => toggleSelectModule(module.id)} />
                            </td>
                            <td className="p-2">{module.title}</td>
                            <td className="p-2 text-xs text-muted-foreground">{course?.title}</td>
                            <td className="p-2 text-xs text-muted-foreground">{module.order}</td>
                            <td className="p-2 flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingModule(module)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteModule(module.id, module.title)}>Delete</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lessons Section */}
        {adminSection === "lessons" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Lessons</h2>
              <Button onClick={() => setShowAddLessonDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Lesson
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">All Lessons</CardTitle>
                  <Button variant="destructive" onClick={handleBulkDeleteLessons} disabled={selectedLessonIds.length === 0}>
                    Delete selected
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-muted-foreground">
                      <tr>
                        <th className="p-2 w-10 text-left">
                          <input type="checkbox" checked={allLessonsSelected} onChange={toggleSelectAllLessons} />
                        </th>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Module</th>
                        <th className="p-2 text-left">Order</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allLessons.map((lesson) => {
                        const module = courses.flatMap((c) => c.modules).find((m) => m.lessons.find((l) => l.id === lesson.id));
                        return (
                          <tr key={lesson.id} className="border-t">
                            <td className="p-2">
                              <input type="checkbox" checked={selectedLessonIds.includes(lesson.id)} onChange={() => toggleSelectLesson(lesson.id)} />
                            </td>
                            <td className="p-2">{lesson.title}</td>
                            <td className="p-2 text-xs text-muted-foreground">{module?.title}</td>
                            <td className="p-2 text-xs text-muted-foreground">{lesson.order}</td>
                            <td className="p-2 flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteLesson(lesson.id, lesson.title)}>Delete</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Topics Section */}
        {adminSection === "topics" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Topics</h2>
              <Button onClick={() => setShowAddTopicDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Topic
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">All Topics</CardTitle>
                  <Button variant="destructive" onClick={handleBulkDeleteTopics} disabled={selectedTopicIds.length === 0}>
                    Delete selected
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/40 text-muted-foreground">
                      <tr>
                        <th className="p-2 w-10 text-left">
                          <input type="checkbox" checked={allTopicsSelected} onChange={toggleSelectAllTopics} />
                        </th>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Lesson</th>
                        <th className="p-2 text-left">Order</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTopics.map((topic) => {
                        const lesson = courses.flatMap((c) => c.modules.flatMap((m) => m.lessons)).find((l) => l.topics.find((t) => t.id === topic.id));
                        return (
                          <tr key={topic.id} className="border-t">
                            <td className="p-2">
                              <input type="checkbox" checked={selectedTopicIds.includes(topic.id)} onChange={() => toggleSelectTopic(topic.id)} />
                            </td>
                            <td className="p-2">{topic.title}</td>
                            <td className="p-2 text-xs text-muted-foreground">{lesson?.title}</td>
                            <td className="p-2 text-xs text-muted-foreground">{topic.order}</td>
                            <td className="p-2 flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setEditingTopic(topic)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTopic(topic.id, topic.title)}>Delete</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Course Modal */}
        <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add Course</DialogTitle>
            </DialogHeader>
            <CreateCourseForm />
          </DialogContent>
        </Dialog>

        {/* Add Module Modal */}
        <Dialog open={showAddModuleDialog} onOpenChange={setShowAddModuleDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add Module</DialogTitle>
            </DialogHeader>
            <CreateModuleForm />
          </DialogContent>
        </Dialog>

        {/* Edit Course Modal */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            {editingCourse && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={editingCourse.title} onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={editingCourse.description || ''} onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})} />
                </div>
                <Button onClick={async () => {
                  try {
                    await updateCourse(editingCourse.id, {title: editingCourse.title, description: editingCourse.description});
                    toast({title: "Course updated"});
                    setEditingCourse(null);
                  } catch(err) {
                    toast({title: "Error updating course", variant: "destructive"});
                  }
                }}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Module Modal */}
        <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
            </DialogHeader>
            {editingModule && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={editingModule.title} onChange={(e) => setEditingModule({...editingModule, title: e.target.value})} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={editingModule.order} onChange={(e) => setEditingModule({...editingModule, order: parseInt(e.target.value)})} />
                </div>
                <Button onClick={async () => {
                  try {
                    await updateModule(editingModule.id, {title: editingModule.title, order: editingModule.order});
                    toast({title: "Module updated"});
                    setEditingModule(null);
                  } catch(err) {
                    toast({title: "Error updating module", variant: "destructive"});
                  }
                }}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Lesson Modal */}
        <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Lesson</DialogTitle>
            </DialogHeader>
            {editingLesson && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={editingLesson.title} onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={editingLesson.order} onChange={(e) => setEditingLesson({...editingLesson, order: parseInt(e.target.value)})} />
                </div>
                <Button onClick={async () => {
                  try {
                    await updateLesson(editingLesson.id, {title: editingLesson.title, order: editingLesson.order});
                    toast({title: "Lesson updated"});
                    setEditingLesson(null);
                  } catch(err) {
                    toast({title: "Error updating lesson", variant: "destructive"});
                  }
                }}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Class Modal */}
        <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
            </DialogHeader>
            {editingClass && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editingClass.name} onChange={(e) => setEditingClass({...editingClass, name: e.target.value})} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={editingClass.description || ''} onChange={(e) => setEditingClass({...editingClass, description: e.target.value})} />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input type="number" value={editingClass.capacity || ''} onChange={(e) => setEditingClass({...editingClass, capacity: e.target.value ? parseInt(e.target.value) : null})} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input value={editingClass.duration || ''} onChange={(e) => setEditingClass({...editingClass, duration: e.target.value})} />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={editingClass.start_date || ''} onChange={(e) => setEditingClass({...editingClass, start_date: e.target.value})} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={editingClass.end_date || ''} onChange={(e) => setEditingClass({...editingClass, end_date: e.target.value})} />
                </div>
                <Button onClick={async () => {
                  try {
                    await updateClass(editingClass.id, {
                      name: editingClass.name,
                      description: editingClass.description,
                      capacity: editingClass.capacity,
                      duration: editingClass.duration,
                      start_date: editingClass.start_date,
                      end_date: editingClass.end_date,
                    });
                    toast({title: "Class updated"});
                    setEditingClass(null);
                    await loadClasses();
                  } catch(err) {
                    toast({title: "Error updating class", variant: "destructive"});
                  }
                }}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Lesson Modal */}
        <Dialog open={showAddLessonDialog} onOpenChange={setShowAddLessonDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Lesson</DialogTitle>
            </DialogHeader>
            <CreateLessonForm />
          </DialogContent>
        </Dialog>

        {/* Add Topic Modal */}
        <Dialog open={showAddTopicDialog} onOpenChange={setShowAddTopicDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add Topic</DialogTitle>
            </DialogHeader>
            <CreateTopicForm />
          </DialogContent>
        </Dialog>

        {/* Edit Topic Modal */}
        <Dialog open={!!editingTopic} onOpenChange={(open) => !open && setEditingTopic(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
            </DialogHeader>
            {editingTopic && (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={editingTopic.title} onChange={(e) => setEditingTopic({...editingTopic, title: e.target.value})} />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input type="number" value={editingTopic.order} onChange={(e) => setEditingTopic({...editingTopic, order: parseInt(e.target.value)})} />
                </div>
                <Button onClick={async () => {
                  try {
                    await updateTopic(editingTopic.id, {title: editingTopic.title, order: editingTopic.order});
                    toast({title: "Topic updated"});
                    setEditingTopic(null);
                  } catch(err) {
                    toast({title: "Error updating topic", variant: "destructive"});
                  }
                }}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add/Edit User Modal */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{isEditingUser ? "Edit user" : "Add user"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} placeholder="Required. Up to 150 chars." />
                <p className="text-xs text-muted-foreground mt-1">Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="first_name">First name</Label>
                  <Input id="first_name" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="last_name">Last name</Label>
                  <Input id="last_name" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <RadioGroup className="mt-2" value={userForm.role || "student"} onValueChange={(v) => setUserForm({ ...userForm, role: v as NewUserInput["role"] })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="role-student" />
                    <Label htmlFor="role-student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teacher" id="role-teacher" />
                    <Label htmlFor="role-teacher">Teacher</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="role-admin" />
                    <Label htmlFor="role-admin">Admin</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="is_staff" checked={!!userForm.is_staff} onCheckedChange={(v) => setUserForm({ ...userForm, is_staff: Boolean(v) })} />
                <div>
                  <Label htmlFor="is_staff">Staff status</Label>
                  <p className="text-xs text-muted-foreground">Designates whether the user can log into the Django admin site.</p>
                </div>
              </div>
              <div>
                <Label>Password-based authentication</Label>
                <RadioGroup className="mt-2" value={userForm.password_auth_enabled ? "enabled" : "disabled"} onValueChange={(v) => setUserForm({ ...userForm, password_auth_enabled: v === "enabled" })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enabled" id="pwd-enabled" />
                    <Label htmlFor="pwd-enabled">Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="disabled" id="pwd-disabled" />
                    <Label htmlFor="pwd-disabled">Disabled</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-1">Whether the user can authenticate with a password. If disabled, other backends (SSO, LDAP) may still authenticate them.</p>
              </div>
              {userForm.password_auth_enabled && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                  {!isEditingUser && (
                    <ul className="text-xs text-muted-foreground mt-1 list-disc pl-5 space-y-0.5">
                      <li>Your password can't be too similar to your other personal information.</li>
                      <li>Your password must contain at least 8 characters.</li>
                      <li>Your password can't be a commonly used password.</li>
                      <li>Your password can't be entirely numeric.</li>
                    </ul>
                  )}
                  {isEditingUser && (
                    <p className="text-xs text-muted-foreground mt-1">Leave blank to keep the existing password.</p>
                  )}
                </div>
              )}
              {userForm.password_auth_enabled && (
                <div>
                  <Label htmlFor="password2">Password confirmation</Label>
                  <Input id="password2" type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Enter the same password as before, for verification.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-end pt-2">
                {!isEditingUser && (
                  <>
                    <Button variant="secondary" onClick={() => submitUserWithValidation("save_continue")} disabled={creatingUser}>
                      Save and continue editing
                    </Button>
                    <Button variant="outline" onClick={() => submitUserWithValidation("save_add")} disabled={creatingUser || addingAnother}>
                      Save and add another
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => submitUserWithValidation("save")}
                  disabled={creatingUser}
                >
                  {isEditingUser ? "Update" : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmOpen} onOpenChange={handleCancel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmOptions?.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmOptions?.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel disabled={confirmLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} disabled={confirmLoading} className="bg-destructive hover:bg-destructive/90">
                {confirmLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default AdminNew;

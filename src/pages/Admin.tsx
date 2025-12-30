import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { CreateCourseForm } from "@/components/admin/CreateCourseForm";
import { CreateModuleForm } from "@/components/admin/CreateModuleForm";
import { CreateLessonForm } from "@/components/admin/CreateLessonForm";
import { CreateTopicForm } from "@/components/admin/CreateTopicForm";
import { CreateKeyTakeawayForm } from "@/components/admin/CreateKeyTakeawayForm";
import { EditContentForm } from "@/components/admin/EditContentForm";
import { useCourseContext } from "@/context/CourseContext";
import { Settings, Edit, Key, Search, X, Users as UsersIcon, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lesson, Module, Topic } from "@/types/course";
import { User, NewUserInput } from "@/types/auth";
import { fetchUsers, createUserAdmin, bulkDeleteUsers } from "@/lib/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

type EditableContent = 
  | { type: "module"; data: Module; courseName: string }
  | { type: "lesson"; data: Lesson; courseName: string; moduleName: string }
  | { type: "topic"; data: Topic; courseName: string; moduleName: string; lessonName: string };

const Admin = () => {
  const { courses } = useCourseContext();
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedLessonForTakeaway, setSelectedLessonForTakeaway] = useState<Lesson | null>(null);
  const [selectedTopicForTakeaway, setSelectedTopicForTakeaway] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "module" | "lesson" | "topic">("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // AuthN/AuthZ state
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [addingAnother, setAddingAnother] = useState(false);
  const [pwd2, setPwd2] = useState("");
  const [userForm, setUserForm] = useState<NewUserInput>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "student",
    is_staff: false,
    password_auth_enabled: true,
    password: "",
  });

  // Build searchable content list
  const searchableContent = useMemo(() => {
    const results: EditableContent[] = [];

    courses.forEach((course) => {
      course.modules.forEach((module) => {
        results.push({
          type: "module",
          data: module,
          courseName: course.title,
        });

        module.lessons.forEach((lesson) => {
          results.push({
            type: "lesson",
            data: lesson,
            courseName: course.title,
            moduleName: module.title,
          });

          lesson.topics.forEach((topic) => {
            results.push({
              type: "topic",
              data: topic,
              courseName: course.title,
              moduleName: module.title,
              lessonName: lesson.title,
            });
          });
        });
      });
    });

    return results;
  }, [courses]);

  // Filter results based on search query and type
  const filteredResults = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return searchableContent.filter((item) => {
      // Filter by type
      if (filterType !== "all" && item.type !== filterType) {
        return false;
      }

      // Filter by search query
      if (!query) return true;

      const moduleName = item.type === "lesson" || item.type === "topic" ? item.moduleName : "";
      const lessonName = item.type === "topic" ? item.lessonName : "";
      const description = item.type === "module" ? item.data.description || "" : "";

      const searchableText = `
        ${item.data.title}
        ${item.courseName}
        ${moduleName}
        ${lessonName}
        ${description}
      `.toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchableContent, searchQuery, filterType]);

  // Reset to first page when filters or search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterType, filteredResults.length]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const paginatedResults = filteredResults.slice((page - 1) * pageSize, page * pageSize);

  // Load users for counts and table
  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to fetch users", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const usersCount = users.length;

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      await bulkDeleteUsers(selectedUserIds);
      toast({ title: "Users deleted", description: `${selectedUserIds.length} user(s) removed.` });
      setSelectedUserIds([]);
      await loadUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to delete users", variant: "destructive" });
    }
  };

  const allSelected = users.length > 0 && selectedUserIds.length === users.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedUserIds([]);
    else setSelectedUserIds(users.map((u) => u.id));
  };

  const handleCreateUser = async (mode: "save" | "save_add" | "save_continue") => {
    try {
      setCreatingUser(true);
      await createUserAdmin(userForm);
      await loadUsers();
      if (mode === "save") {
        setShowAddUser(false);
        toast({ title: "User created" });
        setUserForm({ username: "", email: "", first_name: "", last_name: "", role: "student", is_staff: false, password_auth_enabled: true, password: "" });
      } else if (mode === "save_add") {
        setAddingAnother(true);
        toast({ title: "Saved. Add another." });
        setUserForm({ username: "", email: "", first_name: "", last_name: "", role: "student", is_staff: false, password_auth_enabled: true, password: "" });
        setTimeout(() => setAddingAnother(false), 200);
      } else {
        toast({ title: "Saved. Continue editing." });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "Failed to create user", variant: "destructive" });
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-7xl">

        {/* Page header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 mb-4">
            <Settings className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create and manage courses, modules, lessons, topics, and key takeaways.
          </p>
        </div>

        {/* Auth & AuthZ Section (moved below header) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <nav className="text-xs text-muted-foreground mb-1">Home &gt; Authentication and Authorization &gt; Users</nav>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-6 w-6 text-accent" />
                <h2 className="text-xl font-semibold text-foreground">Authentication and Authorization</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => { setShowAddUser(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Users</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-muted-foreground">Total users in the system</p>
              <p className="text-2xl font-bold text-foreground">{usersCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">All Users</CardTitle>
                <Button variant="destructive" onClick={handleBulkDelete} disabled={selectedUserIds.length === 0}>Delete selected</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[50vh] overflow-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-muted-foreground">
                    <tr>
                      <th className="p-2 w-10 text-left">
                        <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                      </th>
                      <th className="p-2 text-left">Username</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">First Name</th>
                      <th className="p-2 text-left">Last Name</th>
                      <th className="p-2 text-left">Staff Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="p-2">
                          <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleSelectUser(u.id)} />
                        </td>
                        <td className="p-2">{u.username}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.first_name || ""}</td>
                        <td className="p-2">{u.last_name || ""}</td>
                        <td className="p-2">{u.is_staff ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creation Forms Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Create New Content</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <CreateCourseForm />
            <CreateModuleForm />
            <CreateLessonForm />
            <CreateTopicForm />
          </div>
        </div>

        {/* Add User Modal */}
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
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
                  <ul className="text-xs text-muted-foreground mt-1 list-disc pl-5 space-y-0.5">
                    <li>Your password can’t be too similar to your other personal information.</li>
                    <li>Your password must contain at least 8 characters.</li>
                    <li>Your password can’t be a commonly used password.</li>
                    <li>Your password can’t be entirely numeric.</li>
                  </ul>
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
                <Button variant="secondary" onClick={() => handleCreateUser("save_continue")} disabled={creatingUser}>Save and continue editing</Button>
                <Button variant="outline" onClick={() => handleCreateUser("save_add")} disabled={creatingUser || addingAnother}>Save and add another</Button>
                <Button onClick={() => {
                  if (userForm.password_auth_enabled) {
                    const conf = pwd2 || "";
                    if ((userForm.password || "") !== conf) {
                      toast({ title: "Passwords do not match", variant: "destructive" });
                      return;
                    }
                  }
                  handleCreateUser("save");
                }} disabled={creatingUser}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Users Table Modal removed; table shown inline above */}

        {/* Edit/Manage Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit Content
          </h2>

          {/* Edit Form Modal */}
          <Dialog open={!!(editingModule || editingLesson || editingTopic)} onOpenChange={(open) => {
            if (!open) {
              setEditingModule(null);
              setEditingLesson(null);
              setEditingTopic(null);
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingModule && `Edit Module: ${editingModule.title}`}
                  {editingLesson && `Edit Lesson: ${editingLesson.title}`}
                  {editingTopic && `Edit Topic: ${editingTopic.title}`}
                </DialogTitle>
              </DialogHeader>
              {editingModule && (
                <EditContentForm
                  module={editingModule}
                  onSuccess={() => {
                    setEditingModule(null);
                  }}
                />
              )}
              {editingLesson && (
                <EditContentForm
                  lesson={editingLesson}
                  onSuccess={() => {
                    setEditingLesson(null);
                  }}
                />
              )}
              {editingTopic && (
                <EditContentForm
                  topic={editingTopic}
                  onSuccess={() => {
                    setEditingTopic(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Search and Filter Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Search & Filter Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, course, or module..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "module" ? "default" : "outline"}
                  onClick={() => setFilterType("module")}
                >
                  Modules
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "lesson" ? "default" : "outline"}
                  onClick={() => setFilterType("lesson")}
                >
                  Lessons
                </Button>
                <Button
                  size="sm"
                  variant={filterType === "topic" ? "default" : "outline"}
                  onClick={() => setFilterType("topic")}
                >
                  Topics
                </Button>
              </div>

              {/* Results Summary */}
              <div className="text-sm text-muted-foreground flex items-center justify-between flex-wrap gap-2">
                <span>
                  Found <strong>{filteredResults.length}</strong> result(s)
                </span>
                {filteredResults.length > 0 && (
                  <span>
                    Page {page} of {totalPages}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="space-y-3">
            {filteredResults.length > 0 ? (
              paginatedResults.map((item, index) => (
                <Card key={`${item.type}-${item.data.id}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent capitalize">
                            {item.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.courseName}</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{item.data.title}</h3>
                        {(item.type === "lesson" || item.type === "topic") && item.moduleName && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Module: <span className="font-medium">{item.moduleName}</span>
                          </p>
                        )}
                        {item.type === "topic" && item.lessonName && (
                          <p className="text-sm text-muted-foreground">
                            Lesson: <span className="font-medium">{item.lessonName}</span>
                          </p>
                        )}
                        {item.type === "module" && item.data.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {item.data.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (item.type === "module") {
                              setEditingModule(item.data as Module);
                            } else if (item.type === "lesson") {
                              setEditingLesson(item.data as Lesson);
                            } else if (item.type === "topic") {
                              setEditingTopic(item.data as Topic);
                            }
                          }}
                        >
                          Edit
                        </Button>
                        {item.type === "lesson" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLessonForTakeaway(item.data as Lesson);
                              setSelectedTopicForTakeaway(null);
                            }}
                            title="Edit key takeaways"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        )}
                        {item.type === "topic" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTopicForTakeaway(item.data as Topic);
                              setSelectedLessonForTakeaway(null);
                            }}
                            title="Edit key takeaways"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No results found. Try a different search." : "Enter a search query to find content."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredResults.length > pageSize && (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredResults.length)} of {filteredResults.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Hierarchical View (Legacy) - Optional, can be removed later */}
        {filteredResults.length === 0 && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground">All Content</h2>
            <div className="space-y-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.modules.map((module) => (
                      <div key={module.id} className="ml-4 border-l pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{module.title}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingModule(module)}
                          >
                            Edit
                          </Button>
                        </div>

                        <div className="ml-4 space-y-3">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="border-l border-accent/30 pl-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">{lesson.title}</span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingLesson(lesson)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedLessonForTakeaway(lesson)}
                                  >
                                    <Key className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {lesson.topics && lesson.topics.length > 0 && (
                                <div className="text-xs text-muted-foreground ml-2">
                                  Topics:
                                  {lesson.topics.map((topic) => (
                                    <div key={topic.id} className="mt-1">
                                      <button
                                        onClick={() => setEditingTopic(topic)}
                                        className="text-accent hover:underline"
                                      >
                                        {topic.title}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaways Modal */}
        <Dialog open={!!(selectedLessonForTakeaway || selectedTopicForTakeaway)} onOpenChange={(open) => {
          if (!open) {
            setSelectedLessonForTakeaway(null);
            setSelectedTopicForTakeaway(null);
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Key Takeaway</DialogTitle>
            </DialogHeader>
            {selectedLessonForTakeaway && (
              <CreateKeyTakeawayForm
                lesson={selectedLessonForTakeaway}
                onSuccess={() => {
                  setSelectedLessonForTakeaway(null);
                }}
              />
            )}
            {selectedTopicForTakeaway && (
              <CreateKeyTakeawayForm
                topic={selectedTopicForTakeaway}
                onSuccess={() => {
                  setSelectedTopicForTakeaway(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;

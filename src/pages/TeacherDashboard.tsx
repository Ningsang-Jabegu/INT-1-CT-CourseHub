import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCourseContext } from "@/context/CourseContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { LogOut, BookOpen, Users, Plus, Copy, CheckCircle2 } from "lucide-react";
import api, { updateClass, deleteClass } from "@/lib/api";
import { TeacherClass } from "@/types/course";
import { CreateCourseForm } from "@/components/admin/CreateCourseForm";
import { CreateModuleForm } from "@/components/admin/CreateModuleForm";
import { CreateLessonForm } from "@/components/admin/CreateLessonForm";
import { CreateTopicForm } from "@/components/admin/CreateTopicForm";

export function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { courses } = useCourseContext();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingClass, setCreatingClass] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Class creation form state
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [classForm, setClassForm] = useState({
    name: "",
    description: "",
    duration: "",
    start_date: "",
    end_date: "",
    capacity: "",
  });

  // Dialog states for content creation within class
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  // Edit/delete class state
  const [editingClass, setEditingClass] = useState<TeacherClass | null>(null);
  const [deletingClass, setDeletingClass] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    if (user?.role !== "teacher") {
      toast({
        title: "Access Denied",
        description: "You do not have privilege to access this page",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    fetchClasses();
  }, [user, navigate]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/classes/");
      setClasses(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!classForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingClass(true);
      const response = await api.post("/classes/", {
        name: classForm.name,
        description: classForm.description,
        duration: classForm.duration,
        start_date: classForm.start_date || null,
        end_date: classForm.end_date || null,
        capacity: classForm.capacity ? parseInt(classForm.capacity) : null,
      });

      setClasses([response.data, ...classes]);
      toast({
        title: "Success",
        description: `Class created! Code: ${response.data.classCode}`,
      });

      // Reset form and close dialog
      setClassForm({
        name: "",
        description: "",
        duration: "",
        start_date: "",
        end_date: "",
        capacity: "",
      });
      setShowCreateClass(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    } finally {
      setCreatingClass(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied",
      description: "Class code copied to clipboard",
    });
  };

  const getClassCourses = (classId: string) => {
    return courses.filter((c) => c.teacherClassId === classId);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome, {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + (c.studentsCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + (c.coursesCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Class Button */}
        <div className="mb-8">
          <Button onClick={() => setShowCreateClass(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create New Class
          </Button>
        </div>

        {/* Classes Grid */}
        <div className="grid gap-6">
          {classes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No classes yet. Create one to get started!</p>
                <Button onClick={() => setShowCreateClass(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            classes.map((tc) => {
              const classCourses = getClassCourses(tc.id);
              return (
                <Card key={tc.id} className="overflow-hidden">
                  <CardHeader className="bg-accent/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{tc.name}</CardTitle>
                        {tc.description && <CardDescription>{tc.description}</CardDescription>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-md">
                          <code className="text-sm font-mono font-bold text-primary">{tc.classCode}</code>
                          <button
                            onClick={() => copyToClipboard(tc.classCode)}
                            className="cursor-pointer hover:opacity-70"
                          >
                            {copiedCode === tc.classCode ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingClass(tc)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeletingClass({id: tc.id, name: tc.name})}>Delete</Button>
                        </div>
                      </div>
                    </div>
                    {tc.duration && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Duration: {tc.duration}
                        {tc.start_date && tc.end_date && ` (${tc.start_date} to ${tc.end_date})`}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-6">
                    {/* Class Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{tc.studentsCount}</div>
                        <div className="text-xs text-muted-foreground">Students Enrolled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{classCourses.length}</div>
                        <div className="text-xs text-muted-foreground">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {classCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Modules</div>
                      </div>
                      {tc.capacity && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {tc.capacity}
                          </div>
                          <div className="text-xs text-muted-foreground">Capacity</div>
                        </div>
                      )}
                    </div>

                    {/* Courses Section */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Courses</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClass(tc);
                            setShowAddCourse(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Course
                        </Button>
                      </div>

                      {classCourses.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic py-4">
                          No courses yet. Add one to get started!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {classCourses.map((course) => (
                            <div
                              key={course.id}
                              className="p-3 bg-secondary/50 rounded-md border hover:bg-secondary cursor-pointer transition-colors"
                              onClick={() => navigate(`/course/${course.id}`)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-sm">{course.title}</p>
                                  {course.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {course.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                  {course.modules?.length || 0} modules
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t pt-6 mt-6 flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(tc);
                          setShowAddModule(true);
                        }}
                        disabled={classCourses.length === 0}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Module
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(tc);
                          setShowAddLesson(true);
                        }}
                        disabled={classCourses.length === 0}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Lesson
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(tc);
                          setShowAddTopic(true);
                        }}
                        disabled={classCourses.length === 0}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Topic
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Create Class Modal */}
      <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="class-name">Class Name *</Label>
                <Input
                  id="class-name"
                  placeholder="e.g., Introduction to Python"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="class-description">Description</Label>
                <textarea
                  id="class-description"
                  placeholder="Provide a brief description of your class..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  rows={4}
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 8 weeks"
                    value={classForm.duration}
                    onChange={(e) => setClassForm({ ...classForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g., 50"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={classForm.start_date}
                    onChange={(e) => setClassForm({ ...classForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={classForm.end_date}
                    onChange={(e) => setClassForm({ ...classForm, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Preview</h3>
              <div className="bg-secondary/50 p-4 rounded-md space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Class Name</p>
                  <p className="font-medium">{classForm.name || "—"}</p>
                </div>
                {classForm.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{classForm.description}</p>
                  </div>
                )}
                {classForm.duration && (
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm">{classForm.duration}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Details</p>
                  <p className="text-sm">
                    {classForm.start_date && classForm.end_date
                      ? `${classForm.start_date} to ${classForm.end_date}`
                      : classForm.start_date
                      ? `Starts ${classForm.start_date}`
                      : "No dates set"}
                    {classForm.capacity && ` • Capacity: ${classForm.capacity}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCreateClass(false)}
                disabled={creatingClass}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={creatingClass || !classForm.name.trim()}
              >
                {creatingClass ? "Creating..." : "Create Class"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Course Modal */}
      {selectedClass && (
        <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add Course to {selectedClass.name}</DialogTitle>
            </DialogHeader>
            <CreateCourseForm teacherClassId={selectedClass.id} />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Module Modal */}
      {selectedClass && (
        <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add Module</DialogTitle>
            </DialogHeader>
            <CreateModuleForm />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Lesson Modal */}
      {selectedClass && (
        <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add Lesson</DialogTitle>
            </DialogHeader>
            <CreateLessonForm />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Topic Modal */}
      {selectedClass && (
        <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle>Add Topic</DialogTitle>
            </DialogHeader>
            <CreateTopicForm />
          </DialogContent>
        </Dialog>
      )}

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
                  await fetchClasses();
                } catch(err) {
                  toast({title: "Error updating class", variant: "destructive"});
                }
              }}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Class Confirmation */}
      <AlertDialog open={!!deletingClass} onOpenChange={(open) => !open && setDeletingClass(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete class "{deletingClass?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All courses and student enrollments in this class will be deleted permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try {
                await deleteClass(deletingClass!.id);
                toast({title: "Class deleted"});
                setDeletingClass(null);
                await fetchClasses();
              } catch(err) {
                toast({title: "Error deleting class", variant: "destructive"});
              }
            }} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

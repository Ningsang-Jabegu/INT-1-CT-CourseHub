import { useState, useMemo } from "react";
import { BookOpen, BookPlus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCourses } from "@/context/CourseContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface TeacherClass {
  id: string;
  name: string;
  teacherUsername?: string;
  teacher?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

interface CreateCourseFormProps {
  teacherClassId?: string;
}

export function CreateCourseForm({ teacherClassId: initialClassId }: CreateCourseFormProps) {
  const { createCourse, isCreatingCourse } = useCourses();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || "");

  // Fetch teacher classes for this user
  const { data: teacherClasses = [] } = useQuery({
    queryKey: ["teacher-classes", user?.id],
    queryFn: async () => {
      const response = await api.get("/classes/");
      return (response.data as TeacherClass[]) || [];
    },
    staleTime: 30_000,
    enabled: !!user,
  });

  // Filter to show only current user's classes for non-admins
  const availableClasses = useMemo(() => {
    if (user?.role === "admin") {
      return teacherClasses;
    }
    // Check both teacher.username and teacherUsername for compatibility
    return teacherClasses.filter((tc) => {
      const teacherUsername = tc.teacher?.username || tc.teacherUsername;
      return teacherUsername === user?.username;
    });
  }, [teacherClasses, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ title: "Error", description: "Course title is required", variant: "destructive" });
      return;
    }

    if (!selectedClassId) {
      toast({ title: "Error", description: "Please select a teacher class for this course", variant: "destructive" });
      return;
    }

    try {
      await createCourse({ 
        title: title.trim(), 
        description: description.trim(),
        teacherClassId: selectedClassId
      });
      toast({ title: "Success!", description: `Course "${title}" created successfully` });
      setTitle("");
      setDescription("");
      setSelectedClassId("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create course";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-foreground">
        <BookPlus className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Create New Course</h3>
      </div>

      <div className="space-y-3">
        {/* Teacher Class Selector */}
        <div>
          <label htmlFor="course-class" className="block text-sm font-medium text-foreground mb-1.5">
            Select Teacher Class <span className="text-destructive">*</span>
          </label>
          <select
            id="course-class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="">-- Select a class --</option>
            {availableClasses.map((tc) => {
              const teacherName =
                `${tc.teacher?.firstName || tc.teacherFirstName || tc.teacher?.username || tc.teacherUsername || ""}`.trim()
                  ? `${(tc.teacher?.firstName || tc.teacherFirstName || "").trim()} ${(tc.teacher?.lastName || tc.teacherLastName || "").trim()}`.trim()
                  : tc.teacher?.username || tc.teacherUsername || "Unknown Teacher";
              return (
                <option key={tc.id} value={tc.id}>
                  {tc.name} ({teacherName})
                </option>
              );
            })}
          </select>
          {availableClasses.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              No teacher classes available. Create a class first.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="course-title" className="block text-sm font-medium text-foreground mb-1.5">
            Course Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="course-title"
            placeholder="e.g., Introduction to Python"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="course-description" className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <Textarea
            id="course-description"
            placeholder="Brief description of what students will learn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <p className="font-medium">Preview</p>
          <span>Front card style</span>
        </div>

        <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all cursor-pointer">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-semibold text-foreground">
              {title.trim() || "Course title will appear here"}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {description.trim() || "A short description you enter will preview here so you can check length and tone."}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              <span>Modules count will appear</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Lessons count will appear</span>
            </div>
          </div>

          <Button type="button" className="w-full" disabled>
            View Course
          </Button>
        </article>
      </div>

      <Button type="submit" className="w-full" disabled={isCreatingCourse || !selectedClassId}>
        {isCreatingCourse ? "Creating..." : "Create Course"}
      </Button>
    </form>
  );
}


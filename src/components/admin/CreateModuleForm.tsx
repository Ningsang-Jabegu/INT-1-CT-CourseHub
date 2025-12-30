import { useState } from "react";
import { BookOpen, ChevronDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCourses } from "@/context/CourseContext";
import { toast } from "@/hooks/use-toast";

export function CreateModuleForm() {
  const { courses, createModule, isCreatingModule, isLoading } = useCourses();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const selectedCourse = courses.find((course) => course.id === courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toast({ title: "Error", description: "Please select a course", variant: "destructive" });
      return;
    }
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Module title is required", variant: "destructive" });
      return;
    }
    try {
      await createModule({
        title: title.trim(),
        description: description.trim(),
        courseId,
      });
      toast({ title: "Success!", description: `Module "${title}" added to course` });
      setTitle("");
      setDescription("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create module";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-foreground">
        <Layers className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Add Module to Course</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="module-course" className="block text-sm font-medium text-foreground mb-1.5">
            Select Course
          </label>
          <select
            id="module-course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoading}
          >
            <option value="">Choose a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="module-title" className="block text-sm font-medium text-foreground mb-1.5">
            Module Title
          </label>
          <Input
            id="module-title"
            placeholder="e.g., Chapter 1: Getting Started"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="module-description" className="block text-sm font-medium text-foreground mb-1.5">
            Description (optional)
          </label>
          <Textarea
            id="module-description"
            placeholder="Brief description of this module..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <p className="font-medium">Preview</p>
          <span>TOC module style</span>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30">
          <div className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer select-none">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Module 1</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {title.trim() || selectedCourse?.title || "Introduction to Artificial Intelligence"}
              </p>
            </div>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/70 rounded-md px-3 py-2 border border-border">
              <BookOpen className="h-4 w-4" />
              <span>Lessons will appear here</span>
            </div>
            {description.trim() && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {description.trim()}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isCreatingModule}>
        {isCreatingModule ? "Adding..." : "Add Module"}
      </Button>
    </form>
  );
}

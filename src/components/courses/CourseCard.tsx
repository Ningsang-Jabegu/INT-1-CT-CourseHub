import { Link } from "react-router-dom";
import { BookOpen, Layers } from "lucide-react";
import { Course } from "@/types/course";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const moduleCount = course.modules.length;
  const lessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-card hover:border-primary/20 animate-fade-in">
      {/* Card content */}
      <div className="flex-1 space-y-4 flex flex-col">
        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3" style={{ height:"85px"}}>
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            <span>{moduleCount} {moduleCount === 1 ? "module" : "modules"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</span>
          </div>
        </div>

        {/* Action button aligned to bottom */}
        <div className="mt-auto pt-2">
          <Button asChild className="w-full">
            <Link to={`/course/${course.id}`}>View Course</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

import { ChevronDown, PlayCircle, CheckCircle } from "lucide-react";
import { Course, Topic } from "@/types/course";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CourseTableOfContentsProps {
  course: Course;
  currentLessonId: string | null;
  currentTopicId?: string | null;
  onLessonSelect: (lessonId: string, moduleId: string) => void;
  onTopicSelect: (topicId: string, lessonId: string, moduleId: string) => void;
  lessonNumberMap: Record<string, number>;
  completedLessons?: string[];
}

export function CourseTableOfContents({
  course,
  currentLessonId,
  currentTopicId,
  onLessonSelect,
  onTopicSelect,
  lessonNumberMap,
  completedLessons = [],
}: CourseTableOfContentsProps) {
  // Track which modules are expanded
  const [expandedModules, setExpandedModules] = useState<string[]>(
    course.modules.map((m) => m.id) // All expanded by default
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const renderTopics = (
    topics: Topic[],
    prefixParts: number[],
    lessonId: string,
    moduleId: string
  ) => {
    const sortedTopics = [...topics].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    return sortedTopics.map((topic, index) => {
      const parts = [...prefixParts, index + 1];
      const label = parts.join(".");
      const isActive = topic.id === currentTopicId;
      return (
        <div key={topic.id} className="pl-4 border-l border-border/60">
          <button
            onClick={() => onTopicSelect(topic.id, lessonId, moduleId)}
            className={cn(
              "w-full flex items-start gap-3 px-4 py-2 text-left hover:bg-secondary/40",
              isActive && "bg-primary/10 border-l-2 border-primary"
            )}
          >
            <span className={cn("text-xs w-12 shrink-0", isActive ? "text-primary font-medium" : "text-muted-foreground")}>{label}</span>
            <span className={cn("text-sm truncate", isActive ? "text-primary font-medium" : "text-foreground")}>{topic.title}</span>
          </button>

          {topic.children?.length > 0 && (
            <div className="pl-4">{renderTopics(topic.children, parts, lessonId, moduleId)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-card border-r border-border">
      {/* Course Title */}
      <div className="p-4 border-b border-border bg-primary/5">
        <h2 className="font-semibold text-foreground text-sm line-clamp-2">
          {course.title}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {course.modules.length} modules
        </p>
      </div>

      {/* Modules List */}
      <nav className="py-2">
        {course.modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.includes(module.id);
          const hasCurrentLesson = module.lessons.some(
            (l) => l.id === currentLessonId
          );

          return (
            <div key={module.id} className="mb-1">
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-3 text-left transition-colors",
                  "hover:bg-secondary/50",
                  hasCurrentLesson && "bg-primary/5"
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                    !isExpanded && "-rotate-90"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Module {moduleIndex + 1}</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {module.title}
                  </p>
                </div>
              </button>

              {/* Lessons List */}
              {isExpanded && (
                <ul className="bg-secondary/20">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const lessonNumber = lessonNumberMap[lesson.id] ?? lessonIndex + 1;
                    const isActive = lesson.id === currentLessonId;
                    const isCompleted = completedLessons.includes(lesson.id);

                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => onLessonSelect(lesson.id, module.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 pl-10 text-left transition-colors",
                            "hover:bg-secondary/50",
                            isActive && "bg-primary/10 border-l-2 border-primary"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <PlayCircle
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              "text-sm truncate",
                              isActive
                                ? "text-primary font-medium"
                                : "text-foreground"
                            )}
                          >
                            {lessonNumber}. {lesson.title}
                          </span>
                        </button>

                        {lesson.topics?.length > 0 && (
                          <div className="pl-10 pb-2 bg-secondary/10">
                            {renderTopics(
                              lesson.topics.filter((t) => !t.parentId),
                              [lessonNumber],
                              lesson.id,
                              module.id
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

import { useState } from "react";
import { ChevronDown, FileText, Layers } from "lucide-react";
import { Module } from "@/types/course";
import { cn } from "@/lib/utils";

interface ModuleAccordionProps {
  module: Module;
  index: number;
}

export function ModuleAccordion({ module, index }: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-module overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Module header - clickable to expand/collapse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{module.title}</h3>
            <p className="text-sm text-muted-foreground">
              {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
            </p>
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Lessons list - shown when expanded */}
      {isOpen && (
        <div className="border-t border-border animate-slide-down">
          {module.lessons.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground italic">No lessons yet</p>
          ) : (
            <ul className="divide-y divide-border">
              {module.lessons.map((lesson, lessonIndex) => (
                <li key={lesson.id} className="animate-fade-in" style={{ animationDelay: `${lessonIndex * 50}ms` }}>
                  <div className="p-4 bg-lesson hover:bg-lesson/80 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/5 text-primary mt-0.5">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm">{lesson.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {lesson.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

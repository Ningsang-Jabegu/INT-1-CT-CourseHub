import { Lesson, Module, KeyTakeaway, Topic, Exercise, Resource } from "@/types/course";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import MatchExercise from "./exercises/MatchExercise";
import DragDropExercise from "./exercises/DragDropExercise";
import QuizExercise from "./exercises/QuizExercise";

interface LessonViewerProps {
  lesson: Lesson;
  module: Module;
  lessonNumber: string;
  totalLessons: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isTopicView?: boolean;
  topicTitle?: string;
  topicTakeaways?: KeyTakeaway[];
  topicExercises?: Exercise[];
  topicResources?: Resource[];
  topicContent?: string;
  topicHeroMediaType?: "image" | "video" | null;
  topicHeroMediaUrl?: string | null;
}

export function LessonViewer({
  lesson,
  module,
  lessonNumber,
  totalLessons,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isTopicView = false,
  topicTitle,
  topicTakeaways,
  topicExercises,
  topicResources,
  topicContent,
  topicHeroMediaType,
  topicHeroMediaUrl,
}: LessonViewerProps) {
  const displayTitle = isTopicView ? topicTitle : lesson.title;
  const breadcrumb = isTopicView
    ? `${module.title} • Topic ${lessonNumber} of ${totalLessons}`
    : `${module.title} • Lesson ${lessonNumber} of ${totalLessons}`;
  
  // Use topic content if viewing a topic, otherwise use lesson
  const takeaways = isTopicView ? topicTakeaways : lesson.takeaways;
  const exercises = isTopicView ? topicExercises : lesson.exercises;
  const resources = isTopicView ? topicResources : lesson.resources;
  const contentHtml = isTopicView ? (topicContent ?? "") : (lesson.content ?? "");
  const heroMediaType = isTopicView ? topicHeroMediaType ?? null : lesson.heroMediaType ?? null;
  const heroMediaUrl = isTopicView ? topicHeroMediaUrl ?? null : lesson.heroMediaUrl ?? null;

  const renderHero = () => {
    if (!heroMediaUrl) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white">
          <PlayCircle className="h-16 w-16 mb-4 text-primary opacity-80" />
          <p className="text-lg font-medium">{displayTitle}</p>
          <p className="text-sm text-gray-400 mt-2">Video or image will appear here</p>
        </div>
      );
    }

    if (heroMediaType === "image") {
      return (
        <img
          src={heroMediaUrl}
          alt={displayTitle || "Lesson media"}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      );
    }

    if (heroMediaType === "video") {
      const isYouTube = /youtube\.com|youtu\.be/.test(heroMediaUrl);
      const embedUrl = isYouTube
        ? heroMediaUrl
            .replace("watch?v=", "embed/")
            .replace("youtu.be/", "youtube.com/embed/")
        : heroMediaUrl;

      if (isYouTube) {
        return (
          <iframe
            src={embedUrl}
            title={displayTitle || "Video"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }

      return (
        <video
          controls
          className="absolute inset-0 h-full w-full object-cover bg-black"
          src={heroMediaUrl}
        />
      );
    }

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white">
        <PlayCircle className="h-16 w-16 mb-4 text-primary opacity-80" />
        <p className="text-lg font-medium">{displayTitle}</p>
        <p className="text-sm text-gray-400 mt-2">Video or image will appear here</p>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Video Section - No scroll */}
      <div className="bg-black aspect-video w-full flex items-center justify-center relative shrink-0 overflow-hidden rounded-b-none">
        {renderHero()}
      </div>

      {/* Lesson Content - Expands to fill space, scrolls only this section */}
      <div className="flex-1 p-6 md:p-8">
      {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-2">
          {breadcrumb}
        </p>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          {displayTitle}
        </h1>

        {/* Lesson Content */}
        <div className="prose prose-sm md:prose-base max-w-none text-foreground dark:prose-invert prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
          <div
            className="ql-snow ql-editor text-muted-foreground leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Key Takeaways Section */}
          {takeaways && takeaways.length > 0 && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-accent flex items-center gap-2">
                <span>⭐</span> Key Takeaways
              </h3>
              <ul className="space-y-3">
                {takeaways.map((takeaway: KeyTakeaway) => (
                  <li key={takeaway.id} className="flex items-start gap-3">
                    <span className="text-accent font-semibold min-w-fit">✓</span>
                    <div className="ql-snow text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: takeaway.content }} />
                  </li>
                ))}
              </ul>
            </div>
          )}

            {/* Activities / Exercises Section */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                <span>📝</span> Activities & Practice Exercises
              </h3>
              {exercises && exercises.length > 0 ? (
                <div className="space-y-4">
                  {exercises.map((exercise: Exercise) => {
                    const parsed = (() => {
                      try {
                        const data = JSON.parse(exercise.description ?? "{}");
                        return typeof data === "object" ? data : null;
                      } catch {
                        return null;
                      }
                    })();

                    // Match
                    if (parsed?.type === "match" && Array.isArray(parsed.pairs)) {
                      return (
                        <MatchExercise key={exercise.id} title={exercise.title} pairs={parsed.pairs} />
                      );
                    }

                    // Quiz
                    if (parsed?.type === "quiz" && Array.isArray(parsed.questions)) {
                      return (
                        <QuizExercise key={exercise.id} title={exercise.title} questions={parsed.questions} />
                      );
                    }

                    // Drag & Drop
                    if (parsed?.type === "drag-drop" && Array.isArray(parsed.items)) {
                      return (
                        <DragDropExercise key={exercise.id} title={exercise.title} items={parsed.items} />
                      );
                    }

                    // Default rich text exercise
                    return (
                      <div key={exercise.id} className="bg-white dark:bg-slate-900 p-4 rounded border border-primary/20">
                        <h4 className="font-semibold text-primary mb-2">{exercise.title}</h4>
                        <div className="ql-snow ql-editor text-muted-foreground text-sm"
                          dangerouslySetInnerHTML={{ __html: exercise.description }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activities added yet for this {isTopicView ? "topic" : "lesson"}. Check back soon!</p>
              )}
            </div>

            {/* Resources Section */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-accent flex items-center gap-2">
                <span>🔗</span> Useful Resources
              </h3>
              {resources && resources.length > 0 ? (
                <ul className="space-y-3">
                  {resources.map((resource: Resource) => (
                    <li key={resource.id} className="flex items-start gap-3">
                      <span className="text-accent font-semibold min-w-fit">→</span>
                      <div className="flex-1">
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent hover:underline font-medium"
                        >
                          {resource.title}
                        </a>
                        {resource.description && (
                          <p className="text-muted-foreground text-sm mt-1">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No resources added yet for this {isTopicView ? "topic" : "lesson"}. We’ll add links to articles, docs, and videos here.</p>
              )}
            </div>
        </div>
      </div>

      {/* Navigation Footer - No scroll */}
      <div className="border-t border-border bg-card p-4 shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <span className="text-sm text-muted-foreground">
            {lessonNumber} / {totalLessons}
          </span>

          <Button
            onClick={onNext}
            disabled={!hasNext}
            className="gap-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

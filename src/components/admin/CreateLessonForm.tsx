import { useState, useMemo } from "react";
import { FileText, PlayCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCourses } from "@/context/CourseContext";
import { toast } from "@/hooks/use-toast";

export function CreateLessonForm() {
  const { courses, createLesson, isCreatingLesson, isLoading } = useCourses();
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [heroMediaType, setHeroMediaType] = useState<"image" | "video" | "">("");
  const [heroMediaUrl, setHeroMediaUrl] = useState("");
  
  // Key Takeaways
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [currentTakeaway, setCurrentTakeaway] = useState("");
  
  // Exercises
  const [exercises, setExercises] = useState<{ title: string; description: string }[]>([]);
  const [currentExerciseTitle, setCurrentExerciseTitle] = useState("");
  const [currentExerciseDesc, setCurrentExerciseDesc] = useState("");

  // Activities
  const [includeMatch, setIncludeMatch] = useState(false);
  const [matchPairs, setMatchPairs] = useState<{ left: string; right: string }[]>([]);
  const [currentMatchLeft, setCurrentMatchLeft] = useState("");
  const [currentMatchRight, setCurrentMatchRight] = useState("");

  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<{ question: string; options: string[]; correctAnswer: string }[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState("");
  const [currentQuizOptions, setCurrentQuizOptions] = useState<string[]>(["", "", "", ""]);
  const [currentQuizAnswer, setCurrentQuizAnswer] = useState("");

  const [includeDragDrop, setIncludeDragDrop] = useState(false);
  const [dragDropItems, setDragDropItems] = useState<{ prompt: string; matches: string[] }[]>([]);
  const [currentDragDropPrompt, setCurrentDragDropPrompt] = useState("");
  const [currentDragDropMatch, setCurrentDragDropMatch] = useState("");
  const [currentDragDropMatches, setCurrentDragDropMatches] = useState<string[]>([]);
  
  // Resources
  const [resources, setResources] = useState<{ title: string; description: string; url: string }[]>([]);
  const [currentResourceTitle, setCurrentResourceTitle] = useState("");
  const [currentResourceDesc, setCurrentResourceDesc] = useState("");
  const [currentResourceUrl, setCurrentResourceUrl] = useState("");

  // Get modules for selected course
  const availableModules = useMemo(() => {
    const course = courses.find(c => c.id === courseId);
    return course?.modules || [];
  }, [courses, courseId]);

  const selectedCourse = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);
  const selectedModule = useMemo(() => availableModules.find((m) => m.id === moduleId), [availableModules, moduleId]);

  // Reset module when course changes
  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    setModuleId("");
  };

  // Handle Key Takeaway
  const handleAddTakeaway = () => {
    if (currentTakeaway.trim()) {
      setKeyTakeaways([...keyTakeaways, currentTakeaway.trim()]);
      setCurrentTakeaway("");
    }
  };

  const handleRemoveTakeaway = (index: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  const handleTakeawayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTakeaway();
    }
  };

  // Handle Exercise
  const handleAddExercise = () => {
    if (currentExerciseTitle.trim() && currentExerciseDesc.trim()) {
      setExercises([...exercises, { title: currentExerciseTitle.trim(), description: currentExerciseDesc.trim() }]);
      setCurrentExerciseTitle("");
      setCurrentExerciseDesc("");
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // Handle Match Activity
  const handleAddMatchPair = () => {
    if (currentMatchLeft.trim() && currentMatchRight.trim()) {
      setMatchPairs([...matchPairs, { left: currentMatchLeft.trim(), right: currentMatchRight.trim() }]);
      setCurrentMatchLeft("");
      setCurrentMatchRight("");
    }
  };

  const handleRemoveMatchPair = (index: number) => {
    setMatchPairs(matchPairs.filter((_, i) => i !== index));
  };

  // Handle Quiz Activity
  const handleQuizOptionChange = (index: number, value: string) => {
    setCurrentQuizOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const handleAddQuizQuestion = () => {
    const trimmedOptions = currentQuizOptions.map((o) => o.trim()).filter(Boolean);
    if (!currentQuizQuestion.trim() || trimmedOptions.length < 2 || !currentQuizAnswer.trim()) return;
    setQuizQuestions([
      ...quizQuestions,
      {
        question: currentQuizQuestion.trim(),
        options: trimmedOptions,
        correctAnswer: currentQuizAnswer.trim(),
      },
    ]);
    setCurrentQuizQuestion("");
    setCurrentQuizOptions(["", "", "", ""]);
    setCurrentQuizAnswer("");
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  // Handle Drag & Drop Activity
  const handleAddDragDropMatch = () => {
    if (currentDragDropMatch.trim()) {
      setCurrentDragDropMatches([...currentDragDropMatches, currentDragDropMatch.trim()]);
      setCurrentDragDropMatch("");
    }
  };

  const handleAddDragDropItem = () => {
    if (!currentDragDropPrompt.trim() || currentDragDropMatches.length === 0) return;
    setDragDropItems([
      ...dragDropItems,
      { prompt: currentDragDropPrompt.trim(), matches: currentDragDropMatches },
    ]);
    setCurrentDragDropPrompt("");
    setCurrentDragDropMatch("");
    setCurrentDragDropMatches([]);
  };

  const handleRemoveDragDropItem = (index: number) => {
    setDragDropItems(dragDropItems.filter((_, i) => i !== index));
  };

  // Handle Resource
  const handleAddResource = () => {
    if (currentResourceTitle.trim() && currentResourceUrl.trim()) {
      setResources([...resources, { 
        title: currentResourceTitle.trim(), 
        description: currentResourceDesc.trim(),
        url: currentResourceUrl.trim() 
      }]);
      setCurrentResourceTitle("");
      setCurrentResourceDesc("");
      setCurrentResourceUrl("");
    }
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moduleId) {
      toast({ title: "Error", description: "Please select a module", variant: "destructive" });
      return;
    }
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Lesson title is required", variant: "destructive" });
      return;
    }

    if (!content.trim()) {
      toast({ title: "Error", description: "Lesson content is required", variant: "destructive" });
      return;
    }

    if (heroMediaType && !heroMediaUrl.trim()) {
      toast({ title: "Error", description: "Please provide a media URL for the selected hero media type", variant: "destructive" });
      return;
    }

    if (keyTakeaways.length === 0) {
      toast({ title: "Error", description: "At least one key takeaway is required", variant: "destructive" });
      return;
    }

    const activityExercises = [...exercises];

    if (includeMatch && matchPairs.length > 0) {
      activityExercises.push({
        title: "Match the Following",
        description: JSON.stringify({ type: "match", pairs: matchPairs }),
      });
    }

    if (includeQuiz && quizQuestions.length > 0) {
      activityExercises.push({
        title: "Quiz",
        description: JSON.stringify({ type: "quiz", questions: quizQuestions }),
      });
    }

    if (includeDragDrop && dragDropItems.length > 0) {
      activityExercises.push({
        title: "Drag and Drop",
        description: JSON.stringify({ type: "drag-drop", items: dragDropItems }),
      });
    }

    try {
      await createLesson({
        title: title.trim(),
        content: content.trim(),
        heroMediaType: heroMediaType || null,
        heroMediaUrl: heroMediaUrl.trim() || null,
        moduleId,
        keyTakeaways,
        exercises: activityExercises,
        resources,
      });
      toast({ title: "Success!", description: `Lesson "${title}" added to module with all content` });
      setTitle("");
      setContent("");
      setKeyTakeaways([]);
      setExercises([]);
      setHeroMediaType("");
      setHeroMediaUrl("");
      setResources([]);
      setIncludeMatch(false);
      setMatchPairs([]);
      setCurrentMatchLeft("");
      setCurrentMatchRight("");
      setIncludeQuiz(false);
      setQuizQuestions([]);
      setCurrentQuizQuestion("");
      setCurrentQuizOptions(["", "", "", ""]);
      setCurrentQuizAnswer("");
      setIncludeDragDrop(false);
      setDragDropItems([]);
      setCurrentDragDropPrompt("");
      setCurrentDragDropMatch("");
      setCurrentDragDropMatches([]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create lesson";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-foreground">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Add Lesson to Module</h3>
      </div>

      <div className="space-y-3">
        {/* Course selector */}
        <div>
          <label htmlFor="lesson-course" className="block text-sm font-medium text-foreground mb-1.5">
            Select Course
          </label>
          <select
            id="lesson-course"
            value={courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoading}
          >
            <option value="">Choose a course first...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Module selector */}
        <div>
          <label htmlFor="lesson-module" className="block text-sm font-medium text-foreground mb-1.5">
            Select Module
          </label>
          <select
            id="lesson-module"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            disabled={!courseId}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {courseId ? "Choose a module..." : "Select a course first"}
            </option>
            {availableModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>

        {/* Lesson title */}
        <div>
          <label htmlFor="lesson-title" className="block text-sm font-medium text-foreground mb-1.5">
            Lesson Title
          </label>
          <Input
            id="lesson-title"
            placeholder="e.g., Understanding Variables"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Lesson content */}
        <div>
          <label htmlFor="lesson-content" className="block text-sm font-medium text-foreground mb-1.5">
            Lesson Content
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write the lesson content here... You can format with bold, italic, lists, etc."
          />
        </div>

        {/* Hero Media (Image or Video) */}
        <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Hero Media Type (optional)
            </label>
            <select
              value={heroMediaType}
              onChange={(e) => setHeroMediaType(e.target.value as "image" | "video" | "")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">None</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Hero Media URL {heroMediaType ? <span className="text-destructive">*</span> : "(optional)"}
            </label>
            <Input
              placeholder={heroMediaType === "image" ? "https://example.com/hero.jpg" : "https://example.com/video.mp4 or YouTube URL"}
              value={heroMediaUrl}
              onChange={(e) => setHeroMediaUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports direct links. For video, use mp4 links or YouTube/Vimeo URLs.
            </p>
          </div>
        </div>

        {/* Key Takeaways */}
        <div>
          <label htmlFor="key-takeaways" className="block text-sm font-medium text-foreground mb-1.5">
            Key Takeaways <span className="text-destructive">*</span>
          </label>
          <Input
            id="key-takeaways"
            placeholder="Type a key takeaway and press Enter..."
            value={currentTakeaway}
            onChange={(e) => setCurrentTakeaway(e.target.value)}
            onKeyDown={handleTakeawayKeyDown}
          />
          {keyTakeaways.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-md">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="flex-1">{takeaway}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activities & Practice Exercises */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Activities & Practice Exercises
          </label>

          {/* Match the Following */}
          <div className="rounded-lg border border-border p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={includeMatch}
                onChange={(e) => setIncludeMatch(e.target.checked)}
              />
              Match the Following
            </label>
            {includeMatch && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Left side item"
                    value={currentMatchLeft}
                    onChange={(e) => setCurrentMatchLeft(e.target.value)}
                  />
                  <Input
                    placeholder="Right side item"
                    value={currentMatchRight}
                    onChange={(e) => setCurrentMatchRight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMatchPair();
                      }
                    }}
                  />
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddMatchPair}>
                  Add Pair
                </Button>
                {matchPairs.length > 0 && (
                  <div className="space-y-1.5">
                    {matchPairs.map((pair, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-md">
                        <span className="flex-1">{pair.left} → {pair.right}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMatchPair(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quiz */}
          <div className="rounded-lg border border-border p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={includeQuiz}
                onChange={(e) => setIncludeQuiz(e.target.checked)}
              />
              Quiz
            </label>
            {includeQuiz && (
              <div className="space-y-2">
                <Input
                  placeholder="Question"
                  value={currentQuizQuestion}
                  onChange={(e) => setCurrentQuizQuestion(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentQuizOptions.map((option, idx) => (
                    <Input
                      key={idx}
                      placeholder={`Option ${idx + 1}`}
                      value={option}
                      onChange={(e) => handleQuizOptionChange(idx, e.target.value)}
                    />
                  ))}
                </div>
                <Input
                  placeholder="Correct answer"
                  value={currentQuizAnswer}
                  onChange={(e) => setCurrentQuizAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddQuizQuestion();
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddQuizQuestion}>
                  Add Question
                </Button>
                {quizQuestions.length > 0 && (
                  <div className="space-y-1.5">
                    {quizQuestions.map((q, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-md">
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold">{q.question}</p>
                          <p className="text-xs text-muted-foreground">Options: {q.options.join(", ")}</p>
                          <p className="text-xs text-green-700">Answer: {q.correctAnswer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuizQuestion(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drag and Drop */}
          <div className="rounded-lg border border-border p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={includeDragDrop}
                onChange={(e) => setIncludeDragDrop(e.target.checked)}
              />
              Drag and Drop
            </label>
            {includeDragDrop && (
              <div className="space-y-2">
                <Input
                  placeholder="Prompt"
                  value={currentDragDropPrompt}
                  onChange={(e) => setCurrentDragDropPrompt(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Correct match item"
                    value={currentDragDropMatch}
                    onChange={(e) => setCurrentDragDropMatch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDragDropMatch();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddDragDropMatch}>
                    Add Match
                  </Button>
                </div>
                {currentDragDropMatches.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Matches: {currentDragDropMatches.join(", ")}
                  </p>
                )}
                <Button type="button" variant="secondary" size="sm" onClick={handleAddDragDropItem}>
                  Add Drag & Drop Item
                </Button>
                {dragDropItems.length > 0 && (
                  <div className="space-y-1.5">
                    {dragDropItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-md">
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold">{item.prompt}</p>
                          <p className="text-xs text-muted-foreground">Matches: {item.matches.join(", ")}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDragDropItem(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Standard practice exercises */}
          <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
            <p className="text-sm font-medium text-foreground">Custom Practice Exercises</p>
            <Input
              placeholder="Exercise title..."
              value={currentExerciseTitle}
              onChange={(e) => setCurrentExerciseTitle(e.target.value)}
            />
            <Input
              placeholder="Exercise description (press Enter in title to add)..."
              value={currentExerciseDesc}
              onChange={(e) => setCurrentExerciseDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExercise();
                }
              }}
            />
            {exercises.length > 0 && (
              <div className="mt-1.5 space-y-1.5">
                {exercises.map((exercise, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-md">
                    <div className="flex-1">
                      <p className="font-semibold">{exercise.title}</p>
                      <p className="text-muted-foreground text-xs">{exercise.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Useful Resources */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Useful Resources
          </label>
          <div className="space-y-2">
            <Input
              placeholder="Resource title..."
              value={currentResourceTitle}
              onChange={(e) => setCurrentResourceTitle(e.target.value)}
            />
            <Input
              placeholder="Resource description (optional)..."
              value={currentResourceDesc}
              onChange={(e) => setCurrentResourceDesc(e.target.value)}
            />
            <Input
              placeholder="Resource URL (press Enter to add)..."
              value={currentResourceUrl}
              onChange={(e) => setCurrentResourceUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddResource();
                }
              }}
            />
          </div>
          {resources.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {resources.map((resource, index) => (
                <div key={index} className="flex items-start gap-2 text-sm bg-secondary/50 px-3 py-2 rounded-md">
                  <div className="flex-1">
                    <p className="font-semibold">{resource.title}</p>
                    {resource.description && (
                      <p className="text-muted-foreground text-xs">{resource.description}</p>
                    )}
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      {resource.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="mt-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p className="font-medium">Preview</p>
            <span>
              {selectedCourse?.title || "Select course"}
              {selectedModule ? ` • ${selectedModule.title}` : ""}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30">
            <div className="px-4 py-3 border-b border-border cursor-pointer">
              <p className="text-xs text-muted-foreground">Module 1</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {selectedModule?.title || "Module title will preview here"}
              </p>
            </div>

            <div className="bg-secondary/20">
              <div className="w-full flex items-center gap-3 px-4 py-2.5 text-left bg-primary/10 border-l-2 border-primary cursor-pointer">
                <PlayCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary truncate">
                  {title.trim() ? `1. ${title.trim()}` : "1. Lesson title preview"}
                </span>
              </div>
              <div className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-foreground cursor-pointer">
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate text-muted-foreground">2. Next lesson title…</span>
              </div>
            </div>
          </div>

          {/* Key Takeaways Preview */}
          {keyTakeaways.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4 shadow-soft mt-3">
              <h3 className="text-sm font-semibold text-foreground mb-3">Key Takeaways</h3>
              <div className="space-y-2">
                {keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.trim() ? (
            <div
              className="rounded-lg border border-border bg-card p-3 shadow-soft mt-3 prose prose-sm max-w-none text-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : null}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isCreatingLesson}>
        {isCreatingLesson ? "Adding..." : "Add Lesson"}
      </Button>
    </form>
  );
}

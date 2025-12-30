import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCourseContext } from "@/context/CourseContext";
import { Module, Lesson, Topic } from "@/types/course";

interface EditContentFormProps {
  module?: Module;
  lesson?: Lesson;
  topic?: Topic;
  onSuccess?: () => void;
}

type ContentType = "module" | "lesson" | "topic";

export function EditContentForm({ module, lesson, topic, onSuccess }: EditContentFormProps) {
  const { updateModule, updateLesson, updateTopic, isLoading } = useCourseContext();

  const [contentType] = useState<ContentType>(
    module ? "module" : lesson ? "lesson" : "topic"
  );
  const [title, setTitle] = useState(
    module?.title || lesson?.title || topic?.title || ""
  );
  const [description, setDescription] = useState(module?.description || "");
  const [content, setContent] = useState(lesson?.content || topic?.content || "");

  const getDisplayTitle = () => {
    if (module) return `Edit Module: ${module.title}`;
    if (lesson) return `Edit Lesson: ${lesson.title}`;
    if (topic) return `Edit Topic: ${topic.title}`;
    return "Edit Content";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      if (module) {
        await updateModule(module.id, {
          title: title.trim(),
          description: description.trim(),
        });
      } else if (lesson) {
        await updateLesson(lesson.id, {
          title: title.trim(),
          content: content.trim(),
        });
      } else if (topic) {
        await updateTopic(topic.id, {
          title: title.trim(),
          content: content.trim(),
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error updating content:", error);
      alert("Failed to update content");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{getDisplayTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {contentType === "module" ? "Module" : "Title"}
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full"
            />
          </div>

          {/* Description Field (Module only) */}
          {module && (
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <div>
                <RichTextEditor value={description} onChange={setDescription} />
              </div>
            </div>
          )}

          {/* Content Field (Lesson and Topic) */}
          {(lesson || topic) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {contentType === "lesson" ? "Lesson Content" : "Topic Content"}
              </label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

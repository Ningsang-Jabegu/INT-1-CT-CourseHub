import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCourseContext } from "@/context/CourseContext";
import { Lesson, Topic } from "@/types/course";

interface CreateKeyTakeawayFormProps {
  lesson?: Lesson;
  topic?: Topic;
  onSuccess?: () => void;
}

export function CreateKeyTakeawayForm({ lesson, topic, onSuccess }: CreateKeyTakeawayFormProps) {
  const [content, setContent] = useState("");
  const { createKeyTakeaway, isLoading } = useCourseContext();

  const targetItem = lesson || topic;
  const targetType = lesson ? "Lesson" : "Topic";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Please enter a key takeaway");
      return;
    }

    await createKeyTakeaway(lesson?.id || null, topic?.id || null, content);
    setContent("");
    onSuccess?.();
  };

  if (!targetItem) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Key Takeaway</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">For {targetType}: {targetItem.title}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Takeaway Content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="w-full"
          >
            {isLoading ? "Adding..." : "Add Key Takeaway"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

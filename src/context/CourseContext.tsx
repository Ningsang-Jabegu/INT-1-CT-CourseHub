import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Course,
  Module,
  Lesson,
  Topic,
  KeyTakeaway,
  Exercise,
  Resource,
  CreateCourseData,
  CreateModuleData,
  CreateLessonData,
  CreateTopicData,
} from "@/types/course";
import {
  fetchCourses,
  createCourse as createCourseApi,
  createModule as createModuleApi,
  createLesson as createLessonApi,
  createTopic as createTopicApi,
  createKeyTakeaway as createKeyTakeawayApi,
  updateModule as updateModuleApi,
  updateLesson as updateLessonApi,
  updateTopic as updateTopicApi,
  updateKeyTakeaway as updateKeyTakeawayApi,
  deleteKeyTakeaway as deleteKeyTakeawayApi,
  createExercise as createExerciseApi,
  updateExercise as updateExerciseApi,
  deleteExercise as deleteExerciseApi,
  createResource as createResourceApi,
  updateResource as updateResourceApi,
  deleteResource as deleteResourceApi,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface CourseContextType {
  courses: Course[];
  isLoading: boolean;
  isError: boolean;
  getCourse: (id: string) => Course | undefined;
  createCourse: (data: CreateCourseData) => Promise<Course>;
  createModule: (data: CreateModuleData) => Promise<Module>;
  createLesson: (data: CreateLessonData) => Promise<Lesson>;
  createTopic: (data: CreateTopicData) => Promise<Topic>;
  createKeyTakeaway: (lessonId: string | null, topicId: string | null, content: string) => Promise<KeyTakeaway>;
  updateModule: (id: string, data: Partial<{ title: string; description: string }>) => Promise<Module>;
  updateLesson: (id: string, data: Partial<{ title: string; content: string }>) => Promise<Lesson>;
  updateTopic: (id: string, data: Partial<{ title: string; content: string }>) => Promise<Topic>;
  updateKeyTakeaway: (id: string, content: string) => Promise<KeyTakeaway>;
  deleteKeyTakeaway: (id: string) => Promise<void>;
  isCreatingCourse: boolean;
  isCreatingModule: boolean;
  isCreatingLesson: boolean;
  isCreatingTopic: boolean;
  refetchCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Course[]>({
    queryKey: ["courses", user?.id ?? "anon"],
    queryFn: fetchCourses,
    staleTime: 30_000,
    enabled: true, // allow fetching courses for anonymous users (public landing page)
  });

  const courseMutation = useMutation({
    mutationFn: (data: CreateCourseData) => createCourseApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const moduleMutation = useMutation({
    mutationFn: (data: CreateModuleData) => createModuleApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const lessonMutation = useMutation({
    mutationFn: (data: CreateLessonData) => createLessonApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const topicMutation = useMutation({
    mutationFn: (data: CreateTopicData) => createTopicApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const keyTakeawayMutation = useMutation({
    mutationFn: ({ lessonId, topicId, content }: { lessonId: string | null; topicId: string | null; content: string }) =>
      createKeyTakeawayApi(lessonId, topicId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ title: string; description: string }> }) =>
      updateModuleApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ title: string; content: string }> }) =>
      updateLessonApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const updateTopicMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ title: string; content: string }> }) =>
      updateTopicApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const updateKeyTakeawayMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateKeyTakeawayApi(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const deleteKeyTakeawayMutation = useMutation({
    mutationFn: (id: string) => deleteKeyTakeawayApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const getCourse = (id: string): Course | undefined => {
    return courses.find((course) => course.id === id);
  };

  const createCourse = async (data: CreateCourseData): Promise<Course> => {
    return courseMutation.mutateAsync(data);
  };

  const createModule = async (data: CreateModuleData): Promise<Module> => {
    const existingCourse = getCourse(data.courseId);
    const order = (existingCourse?.modules.length ?? 0) + 1;
    return moduleMutation.mutateAsync({ ...data, order });
  };

  const createLesson = async (data: CreateLessonData): Promise<Lesson> => {
    const module = courses
      .flatMap((course) => course.modules)
      .find((m) => m.id === data.moduleId);
    const order = (module?.lessons.length ?? 0) + 1;
    return lessonMutation.mutateAsync({ ...data, order });
  };

  const createTopic = async (data: CreateTopicData): Promise<Topic> => {
    const lesson = courses
      .flatMap((course) => course.modules.flatMap((m) => m.lessons))
      .find((l) => l.id === data.lessonId);

    const findTopicById = (topics: Topic[], id: string): Topic | undefined => {
      for (const topic of topics) {
        if (topic.id === id) return topic;
        const found = findTopicById(topic.children, id);
        if (found) return found;
      }
      return undefined;
    };

    const siblings = (parentId?: string | null) => {
      if (!lesson) return [] as Topic[];
      if (parentId) {
        const parent = findTopicById(lesson.topics, parentId);
        return parent?.children ?? [];
      }
      return lesson.topics.filter((t) => !t.parentId);
    };

    const order = siblings(data.parentId ?? null).length + 1;
    return topicMutation.mutateAsync({ ...data, order });
  };

  const createKeyTakeaway = async (lessonId: string | null, topicId: string | null, content: string): Promise<KeyTakeaway> => {
    return keyTakeawayMutation.mutateAsync({ lessonId, topicId, content });
  };

  const updateModule = async (
    id: string,
    data: Partial<{ title: string; description: string }>
  ): Promise<Module> => {
    return updateModuleMutation.mutateAsync({ id, data });
  };

  const updateLesson = async (
    id: string,
    data: Partial<{ title: string; content: string; heroMediaType?: "image" | "video" | null; heroMediaUrl?: string | null }>
  ): Promise<Lesson> => {
    return updateLessonMutation.mutateAsync({ id, data });
  };

  const updateTopic = async (
    id: string,
    data: Partial<{ title: string; content: string; heroMediaType?: "image" | "video" | null; heroMediaUrl?: string | null }>
  ): Promise<Topic> => {
    return updateTopicMutation.mutateAsync({ id, data });
  };

  const updateKeyTakeaway = async (id: string, content: string): Promise<KeyTakeaway> => {
    return updateKeyTakeawayMutation.mutateAsync({ id, content });
  };

  const deleteKeyTakeaway = async (id: string): Promise<void> => {
    return deleteKeyTakeawayMutation.mutateAsync(id);
  };

  const value = useMemo(
    () => ({
      courses,
      isLoading,
      isError,
      getCourse,
      createCourse,
      createModule,
      createLesson,
      createTopic,
      createKeyTakeaway,
      updateModule,
      updateLesson,
      updateTopic,
      updateKeyTakeaway,
      deleteKeyTakeaway,
      isCreatingCourse: courseMutation.isPending,
      isCreatingModule: moduleMutation.isPending,
      isCreatingLesson: lessonMutation.isPending,
      isCreatingTopic: topicMutation.isPending,
      refetchCourses: () => refetch().then(() => undefined),
    }),
    [
      courses,
      isLoading,
      isError,
      courseMutation.isPending,
      moduleMutation.isPending,
      lessonMutation.isPending,
      topicMutation.isPending,
      refetch,
    ]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

// Custom hook to use the course context
export function useCourseContext() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
}

// Alias for backwards compatibility
export function useCourses() {
  return useCourseContext();
}

// Type definitions for Course Module Management System

export interface KeyTakeaway {
  id: string;
  content: string;
  order: number;
  lessonId?: string;
  topicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  order: number;
  lessonId?: string;
  topicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  order: number;
  lessonId?: string;
  topicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  heroMediaType?: "image" | "video" | null;
  heroMediaUrl?: string | null;
  order: number;
  lessonId: string;
  parentId?: string | null;
  children: Topic[];
  takeaways: KeyTakeaway[];
  exercises: Exercise[];
  resources: Resource[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  heroMediaType?: "image" | "video" | null;
  heroMediaUrl?: string | null;
  moduleId: string;
  order: number;
  topics: Topic[];
  takeaways: KeyTakeaway[];
  exercises: Exercise[];
  resources: Resource[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  lessons: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherClassId?: string;
  createdAt: string;
   updatedAt?: string;
  modules: Module[];
}

export interface TeacherClass {
  id: string;
  name: string;
  description: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  classCode: string;
  teacherId: number;
  teacherFirstName: string;
  teacherLastName: string;
  coursesCount: number;
  studentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassEnrollment {
  id: string;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  className: string;
  classCode: string;
  teacherFirstName: string;
  teacherLastName: string;
  enrolledAt: string;
}

// Form types for creating new items
export interface CreateCourseData {
  title: string;
  description: string;
  teacherClassId: string;
}

export interface CreateModuleData {
  title: string;
  description: string;
  courseId: string;
  order?: number;
}

export interface CreateLessonData {
  title: string;
  content: string;
  heroMediaType?: "image" | "video" | null;
  heroMediaUrl?: string | null;
  moduleId: string;
  order?: number;
  keyTakeaways?: string[];
  exercises?: { title: string; description: string }[];
  resources?: { title: string; description: string; url: string }[];
}

export interface CreateTopicData {
  title: string;
  content: string;
  heroMediaType?: "image" | "video" | null;
  heroMediaUrl?: string | null;
  lessonId: string;
  parentId?: string | null;
  order?: number;
  keyTakeaways?: string[];
  exercises?: { title: string; description: string }[];
  resources?: { title: string; description: string; url: string }[];
}

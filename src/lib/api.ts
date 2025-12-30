import axios from 'axios';
import {
  Course,
  CreateCourseData,
  CreateLessonData,
  CreateModuleData,
  CreateTopicData,
  KeyTakeaway,
  Exercise,
  Resource,
  Lesson,
  Module,
  Topic,
} from "@/types/course";
import { LoginCredentials, RegisterData, AuthResponse, User, NewUserInput } from "@/types/auth";

// Use relative base with Vite proxy in dev to keep same-origin cookies
const API_BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

console.log("[API] Base URL:", API_BASE);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get CSRF token from cookie
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return value;
    }
  }
  return null;
}

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const token = getCsrfToken();
  if (token) {
    config.headers['X-CSRFToken'] = token;
  }
  return config;
});

export default api;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    const message = text || response.statusText;
    console.error(`[API] Error (${response.status}):`, message);
    throw new Error(message);
  }
  return response.json();
}

export async function fetchCourses(): Promise<Course[]> {
  const url = `${API_BASE}/courses/`;
  console.log("[API] Fetching courses from:", url);
  try {
    const response = await api.get(`/courses/`);
    return response.data as Course[];
  } catch (error) {
    console.error("[API] Fetch failed:", error);
    throw error;
  }
}

export async function createCourse(data: CreateCourseData): Promise<Course> {
  const response = await api.post<Course>("/courses/", data);
  return response.data;
}

export async function updateCourse(id: string, data: Partial<CreateCourseData>): Promise<Course> {
  const response = await api.patch<Course>(`/courses/${id}/`, data);
  return response.data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}/`);
}

export async function createModule(data: CreateModuleData): Promise<Module> {
  const payload = { ...data, order: data.order ?? 1 };
  const response = await api.post<Module>("/modules/", payload);
  return response.data;
}

export async function deleteModule(id: string): Promise<void> {
  await api.delete(`/modules/${id}/`);
}

export async function createLesson(data: CreateLessonData): Promise<Lesson> {
  const payload = { ...data, order: data.order ?? 1 };
  const response = await api.post<Lesson>("/lessons/", payload);
  return response.data;
}

export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/lessons/${id}/`);
}

export async function createTopic(data: CreateTopicData): Promise<Topic> {
  const payload = { ...data, order: data.order ?? 1 };
  const response = await api.post<Topic>("/topics/", payload);
  return response.data;
}

export async function deleteTopic(id: string): Promise<void> {
  await api.delete(`/topics/${id}/`);
}

export async function createKeyTakeaway(
  lessonId: string | null,
  topicId: string | null,
  content: string
): Promise<KeyTakeaway> {
  const response = await api.post<KeyTakeaway>("/takeaways/", {
    lessonId,
    topicId,
    content,
    order: 1,
  });
  return response.data;
}

export async function updateModule(
  id: string,
  data: Partial<{ title: string; description: string }>
): Promise<Module> {
  const response = await api.patch<Module>(`/modules/${id}/`, data);
  return response.data;
}

export async function updateLesson(
  id: string,
  data: Partial<{ title: string; content: string; heroMediaType?: "image" | "video" | null; heroMediaUrl?: string | null }>
): Promise<Lesson> {
  const response = await api.patch<Lesson>(`/lessons/${id}/`, data);
  return response.data;
}

export async function updateTopic(
  id: string,
  data: Partial<{ title: string; content: string; heroMediaType?: "image" | "video" | null; heroMediaUrl?: string | null }>
): Promise<Topic> {
  const response = await api.patch<Topic>(`/topics/${id}/`, data);
  return response.data;
}

export async function updateKeyTakeaway(
  id: string,
  content: string
): Promise<KeyTakeaway> {
  const response = await api.patch<KeyTakeaway>(`/takeaways/${id}/`, { content });
  return response.data;
}

export async function deleteKeyTakeaway(id: string): Promise<void> {
  await api.delete(`/takeaways/${id}/`);
}

export async function createExercise(
  lessonId: string | null,
  topicId: string | null,
  title: string,
  description: string
): Promise<Exercise> {
  const response = await api.post<Exercise>("/exercises/", {
    lessonId,
    topicId,
    title,
    description,
    order: 1,
  });
  return response.data;
}

export async function updateExercise(
  id: string,
  data: Partial<{ title: string; description: string }>
): Promise<Exercise> {
  const response = await api.patch<Exercise>(`/exercises/${id}/`, data);
  return response.data;
}

export async function deleteExercise(id: string): Promise<void> {
  await api.delete(`/exercises/${id}/`);
}

export async function createResource(
  lessonId: string | null,
  topicId: string | null,
  title: string,
  description: string,
  url: string
): Promise<Resource> {
  const response = await api.post<Resource>("/resources/", {
    lessonId,
    topicId,
    title,
    description,
    url,
    order: 1,
  });
  return response.data;
}

export async function updateResource(
  id: string,
  data: Partial<{ title: string; description: string; url: string }>
): Promise<Resource> {
  const response = await api.patch<Resource>(`/resources/${id}/`, data);
  return response.data;
}

export async function deleteResource(id: string): Promise<void> {
  await api.delete(`/resources/${id}/`);
}

// Authentication API
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login/", credentials);
  return response.data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register/", data);
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout/");
}

export async function checkAuth(): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>("/auth/check/");
  return response.data;
}

export async function getCsrfTokenFromServer(): Promise<string> {
  const response = await api.get<{ csrfToken: string }>("/auth/csrf/");
  return response.data.csrfToken;
}

// Certificates
export async function generateCourseCertificate(courseId: string): Promise<Blob> {
  const response = await api.post(`/courses/${courseId}/generate-certificate/`, {}, { responseType: 'blob' });
  return response.data as Blob;
}

export interface CertificateInfo {
  certificateNumber: string;
  issuedAt: string;
  studentName: string;
  courseTitle: string;
  courseDescription: string;
  instructorName: string;
  obtainedScore: number;
  totalScore: number;
  percentage: number;
  userName: string;
  userEmail: string;
}

export async function getCertificateInfo(courseId: string): Promise<CertificateInfo> {
  const response = await api.get<CertificateInfo>(`/courses/${courseId}/certificate-info/`);
  return response.data;
}

export interface CertificateVerificationResult {
  valid: boolean;
  certificateNumber: string;
  issuedAt: string;
  courseTitle: string;
  courseDescription: string;
  studentName: string;
  instructorName: string;
  obtainedScore: number;
  totalScore: number;
  percentage: number;
  verifiedAt: string;
  certificateStatus: string;
}

export async function verifyCertificate(certificateNumber: string): Promise<CertificateVerificationResult> {
  const response = await api.get<CertificateVerificationResult>(
    `/courses/verify-certificate/?certificate_number=${encodeURIComponent(certificateNumber)}`
  );
  return response.data;
}

export async function updateCourseProgress(courseId: string, payload: { obtained_score: number; total_score: number; is_completed?: boolean }) {
  const response = await api.post(`/courses/${courseId}/progress/`, payload);
  return response.data as { obtained_score: number; total_score: number; percentage: number; is_completed: boolean };
}

// Admin Users API
export async function fetchUsers(): Promise<User[]> {
  const response = await api.get<User[]>("/auth/users/");
  return response.data;
}

export async function createUserAdmin(data: NewUserInput): Promise<User> {
  const response = await api.post<User>("/auth/users/", data);
  return response.data;
}

export async function updateUserAdmin(id: number, data: Partial<NewUserInput>): Promise<User> {
  const response = await api.patch<User>(`/auth/users/${id}/`, data);
  return response.data;
}

export async function bulkDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
  const response = await api.post<{ deleted: number }>("/auth/users/bulk-delete/", { ids });
  return response.data;
}

// Bulk Delete for Courses, Modules, Lessons, Topics
export async function bulkDeleteCourses(ids: string[]): Promise<{ deleted: number }> {
  const response = await api.post<{ deleted: number }>("/courses/bulk-delete/", { ids });
  return response.data;
}

export async function bulkDeleteModules(ids: string[]): Promise<{ deleted: number }> {
  const response = await api.post<{ deleted: number }>("/modules/bulk-delete/", { ids });
  return response.data;
}

export async function bulkDeleteLessons(ids: string[]): Promise<{ deleted: number }> {
  const response = await api.post<{ deleted: number }>("/lessons/bulk-delete/", { ids });
  return response.data;
}

export async function bulkDeleteTopics(ids: string[]): Promise<{ deleted: number }> {
  const response = await api.post<{ deleted: number }>("/topics/bulk-delete/", { ids });
  return response.data;
}

// Classes API
export async function createClass(data: any): Promise<any> {
  const response = await api.post("/classes/", data);
  return response.data;
}

export async function updateClass(id: string, data: any): Promise<any> {
  const response = await api.patch(`/classes/${id}/`, data);
  return response.data;
}

export async function deleteClass(id: string): Promise<void> {
  await api.delete(`/classes/${id}/`);
}

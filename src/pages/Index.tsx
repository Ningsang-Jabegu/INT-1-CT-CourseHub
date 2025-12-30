import { Header } from "@/components/layout/Header";
import { CourseCard } from "@/components/courses/CourseCard";
import { useCourses } from "@/context/CourseContext";
import { GraduationCap } from "lucide-react";

const Index = () => {
  const { courses, isLoading, isError, refetchCourses } = useCourses();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary mb-4">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Available Courses</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore our collection of courses and start your learning journey today.
          </p>
        </div>

        {/* Course grid */}
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-12">
            <p className="text-destructive font-medium mb-2">Failed to load courses.</p>
            <button
              onClick={refetchCourses}
              className="text-sm text-primary underline decoration-dotted underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Go to the Admin page to create your first course.
            </p>
          </div>
        )}

        {!isLoading && !isError && courses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <div key={course.id} style={{ animationDelay: `${index * 100}ms` }}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

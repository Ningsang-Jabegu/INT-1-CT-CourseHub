import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { LogOut, BookOpen, GraduationCap } from "lucide-react";
import api from "@/lib/api";
import { ClassEnrollment, Course } from "@/types/course";

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (user?.role !== "student") {
      toast({
        title: "Access Denied",
        description: "You do not have privilege to access this page",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, coursesRes] = await Promise.all([
        api.get("/enrollments/"),
        api.get("/courses/"),
      ]);
      setEnrollments(enrollmentsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class code",
        variant: "destructive",
      });
      return;
    }

    setEnrolling(true);
    try {
      await api.post("/classes/enroll/", { class_code: classCode.toUpperCase() });
      toast({
        title: "Success",
        description: "Successfully enrolled in class",
      });
      setClassCode("");
      fetchData();
    } catch (error: any) {
      const message = error?.response?.data?.error || "Failed to enroll";
      toast({
        title: "Enrollment Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome, {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Enroll Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enroll in a Class</CardTitle>
            <CardDescription>Enter the class code provided by your teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEnroll} className="flex gap-2">
              <Input
                placeholder="Enter class code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                disabled={enrolling}
                maxLength={10}
              />
              <Button type="submit" disabled={enrolling}>
                {enrolling ? "Enrolling..." : "Enroll"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enrolled Classes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Classes you are currently enrolled in</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No enrollments yet. Use a class code to enroll.
              </p>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{enrollment.className}</h3>
                      <p className="text-sm text-gray-600">
                        Teacher: {enrollment.teacherFirstName && enrollment.teacherLastName ? `${enrollment.teacherFirstName} ${enrollment.teacherLastName}` : 'N/A'} | Code: {enrollment.classCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Courses from your enrolled classes</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No courses available yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

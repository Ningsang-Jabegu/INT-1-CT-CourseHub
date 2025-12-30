import { useParams, Link } from "react-router-dom";
import { useCourses } from "@/context/CourseContext";
import { ArrowLeft, Menu, X, Share2, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseTableOfContents } from "@/components/courses/CourseTableOfContents";
import { LessonViewer } from "@/components/courses/LessonViewer";
import { useState, useMemo, useEffect } from "react";
import { Lesson, Module, Topic, Exercise, Resource, KeyTakeaway } from "@/types/course";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import * as api from "@/lib/api";

interface ContentNode {
  type: 'lesson' | 'topic';
  id: string;
  title: string;
  content: string;
  lessonId: string;
  lesson: Lesson;
  module: Module;
  globalIndex: number;
  displayNumber: string;
  topicParentId?: string | null;
  topic?: Topic;
  takeaways?: any[];
  exercises?: Exercise[];
  resources?: Resource[];
  heroMediaType?: Topic['heroMediaType']; // added
  heroMediaUrl?: Topic['heroMediaUrl'];   // added
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getCourse, isLoading, isError } = useCourses();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [currentContentType, setCurrentContentType] = useState<'lesson' | 'topic'>('lesson');
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<api.CertificateInfo | null>(null);
  const [isLoadingCert, setIsLoadingCert] = useState(false);

  const rawCourse = getCourse(id || "");
  const course = useMemo(() => {
    if (!rawCourse) return undefined;

    const sortedModules = [...rawCourse.modules]
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
      .map((module) => ({
        ...module,
        lessons: [...module.lessons].sort(
          (a, b) => a.order - b.order || a.title.localeCompare(b.title)
        ),
      }));

    return {
      ...rawCourse,
      modules: sortedModules,
    };
  }, [rawCourse]);

  // Build hierarchical content flow: 1, 1.1, 1.2, 1.1.1, 2, 2.1, etc.
  const contentFlow = useMemo(() => {
    if (!course) return [];

    const nodes: ContentNode[] = [];
    let globalIndex = 0;

    const walkTopics = (topics: Topic[], lessonNum: string, lesson: Lesson, module: Module, depth: number): void => {
      const sortedTopics = [...topics].sort((a, b) => a.order - b.order);
      sortedTopics.forEach((topic, idx) => {
        const topicNum = `${lessonNum}.${idx + 1}`;
        nodes.push({
          type: 'topic',
          id: topic.id,
          title: topic.title,
          content: topic.content,
          lessonId: lesson.id,
          lesson,
          module,
          globalIndex,
          displayNumber: topicNum,
          topicParentId: topic.parentId,
          topic,
          takeaways: topic.takeaways,
          exercises: topic.exercises,
          resources: topic.resources,
          heroMediaType: topic.heroMediaType, // added
          heroMediaUrl: topic.heroMediaUrl,   // added
        });
        globalIndex++;

        if (topic.children?.length > 0) {
          walkTopics(topic.children, topicNum, lesson, module, depth + 1);
        }
      });
    };

    course.modules.forEach((module) => {
      module.lessons.forEach((lesson, lessonIdx) => {
        const lessonNum = Object.values(nodes).filter(n => n.type === 'lesson').length + 1;
        
        nodes.push({
          type: 'lesson',
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          lessonId: lesson.id,
          lesson,
          module,
          globalIndex,
          displayNumber: String(lessonNum),
        });
        globalIndex++;

        const rootTopics = lesson.topics?.filter(t => !t.parentId) ?? [];
        if (rootTopics.length > 0) {
          walkTopics(rootTopics, String(lessonNum), lesson, module, 0);
        }
      });
    });

    return nodes;
  }, [course]);

  // Set first content as default
  useEffect(() => {
    if (contentFlow.length > 0 && !currentContentId) {
      const first = contentFlow[0];
      setCurrentContentId(first.id);
      setCurrentContentType(first.type);
      setCurrentModuleId(first.module.id);
    }
  }, [contentFlow, currentContentId]);

  // Get current content data
  const currentContent = useMemo(() => {
    return contentFlow.find((n) => n.id === currentContentId && n.type === currentContentType);
  }, [contentFlow, currentContentId, currentContentType]);

  const handleContentSelect = (contentId: string, contentType: 'lesson' | 'topic', moduleId: string) => {
    setCurrentContentId(contentId);
    setCurrentContentType(contentType);
    setCurrentModuleId(moduleId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleTopicSelect = (topicId: string, lessonId: string, moduleId: string) => {
    setCurrentContentId(topicId);
    setCurrentContentType('topic');
    setCurrentModuleId(moduleId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handlePrevious = () => {
    if (!currentContent) return;
    const prevIndex = currentContent.globalIndex - 1;
    if (prevIndex >= 0) {
      const prev = contentFlow[prevIndex];
      setCurrentContentId(prev.id);
      setCurrentContentType(prev.type);
      setCurrentModuleId(prev.module.id);
    }
  };

  const handleNext = () => {
    if (!currentContent) return;
    const nextIndex = currentContent.globalIndex + 1;
    if (nextIndex < contentFlow.length) {
      const next = contentFlow[nextIndex];
      setCurrentContentId(next.id);
      setCurrentContentType(next.type);
      setCurrentModuleId(next.module.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Unable to load course</h1>
          <p className="text-muted-foreground mb-6">Please try again later.</p>
          <Button asChild>
            <Link to="/">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentModule = course.modules.find((m) => m.id === currentModuleId);
  const contentNumber = currentContent?.displayNumber ?? "1";
  const totalContent = contentFlow.length;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Back to courses */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">All Courses</span>
          </Link>
        </div>

        <div className="ml-4 flex-1 min-w-0">
          <h1 className="text-sm font-medium text-foreground truncate">
            {course.title}
          </h1>
        </div>

        {/* Actions */}
        {user?.role === 'student' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const blob = await api.generateCourseCertificate(course.id);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `certificate_${course.title}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                  toast({ title: "Certificate downloaded successfully" });
                } catch (err: any) {
                  toast({ 
                    title: "Certificate generated", 
                    description: "Your certificate is ready. You can download it anytime."
                  });
                }
              }}
            >
              Download Certificate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  setIsLoadingCert(true);
                  const info = await api.getCertificateInfo(course.id);
                  setCertificateInfo(info);
                  setShareDialogOpen(true);
                } catch (err: any) {
                  toast({ 
                    title: "Error", 
                    description: "Failed to load certificate info. Please download the certificate first.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={isLoadingCert}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        )}

        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex gap-2"
        >
          <Menu className="h-4 w-4" />
          <span>{sidebarOpen ? "Hide" : "Show"} Contents</span>
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 mt-14">
        {/* Sidebar - Table of Contents */}
        <aside
          className={`
            ${sidebarOpen ? "w-80" : "w-0"}
            transition-all duration-300 shrink-0
            absolute md:sticky md:top-0 h-auto z-10
            bg-card
          `}
        >
          {sidebarOpen && (
            <CourseTableOfContents
              course={course}
              currentLessonId={currentContentType === 'lesson' ? currentContentId : null}
              currentTopicId={currentContentType === 'topic' ? currentContentId : null}
              onLessonSelect={(lessonId, moduleId) => handleContentSelect(lessonId, 'lesson', moduleId)}
              onTopicSelect={handleTopicSelect}
              lessonNumberMap={{}}
            />
          )}
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[5] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Lesson Content */}
        <main className="flex-1 overflow-auto min-h-0">
          {currentContent && currentModule ? (
            <LessonViewer
              lesson={currentContent.lesson}
              module={currentModule}
              lessonNumber={contentNumber}
              totalLessons={totalContent}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={currentContent.globalIndex > 0}
              hasNext={currentContent.globalIndex < contentFlow.length - 1}
              isTopicView={currentContent.type === 'topic'}
              topicTitle={currentContent.type === 'topic' ? currentContent.title : undefined}
              topicContent={currentContent.type === 'topic' ? currentContent.content : undefined}
              topicTakeaways={currentContent.type === 'topic' ? currentContent.takeaways : undefined}
              topicExercises={currentContent.type === 'topic' ? currentContent.exercises : undefined}
              topicResources={currentContent.type === 'topic' ? currentContent.resources : undefined}
              topicHeroMediaType={currentContent.type === 'topic' ? currentContent.heroMediaType : undefined}
              topicHeroMediaUrl={currentContent.type === 'topic' ? currentContent.heroMediaUrl : undefined}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No lessons available in this course.</p>
            </div>
          )}
        </main>
      </div>

      {/* Share Certificate Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your Certificate</DialogTitle>
            <DialogDescription>
              Share your achievement with professional networks
            </DialogDescription>
          </DialogHeader>
          
          {certificateInfo && (
            <div className="space-y-6">
              {/* Certificate Details Preview */}
              <div className="bg-accent/5 p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-3">{certificateInfo.courseTitle}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Certificate No.</p>
                    <p className="font-mono font-bold">{certificateInfo.certificateNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Issued</p>
                    <p className="font-semibold">{new Date(certificateInfo.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instructor</p>
                    <p className="font-semibold">{certificateInfo.instructorName || "N/A"}</p>
                  </div>
                  {certificateInfo.percentage > 0 && (
                    <div>
                      <p className="text-muted-foreground">Score</p>
                      <p className="font-semibold">{certificateInfo.percentage.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Share on:</p>
                
                {/* LinkedIn Share */}
                <LinkedInShareButton certificateInfo={certificateInfo} />
                
                {/* Email Share */}
                <EmailShareButton certificateInfo={certificateInfo} />
                
                {/* Custom Share Link */}
                <CopyShareLink certificateInfo={certificateInfo} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// LinkedIn Share Button Component
const LinkedInShareButton = ({ certificateInfo }: { certificateInfo: api.CertificateInfo }) => {
  const [showLinkedInGuide, setShowLinkedInGuide] = useState(false);

  const handleLinkedInShare = () => {
    // Open LinkedIn's "Add license or certification" page
    window.open(
      "https://www.linkedin.com/profile/add?section=certifications",
      "linkedin_cert",
      "width=800,height=600"
    );

    // Show instruction guide with pre-filled data
    setShowLinkedInGuide(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  if (showLinkedInGuide) {
    return (
      <div className="space-y-3 border border-blue-200 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-blue-900">LinkedIn Certification Form</p>
            <p className="text-xs text-blue-700 mt-1">
              Copy and paste the fields below into LinkedIn's "Add license or certification" form
            </p>
          </div>
          <button
            onClick={() => setShowLinkedInGuide(false)}
            className="text-blue-500 hover:text-blue-700"
          >
            ✕
          </button>
        </div>

        {/* Form field mapping */}
        <div className="space-y-3 text-sm">
          {/* Name Field */}
          <div className="bg-white p-3 rounded border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-700">Name *</label>
              <button
                onClick={() => copyToClipboard(certificateInfo.courseTitle, "Name")}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                Copy
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={certificateInfo.courseTitle}
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
            />
          </div>

          {/* Issuing Organization Field */}
          <div className="bg-white p-3 rounded border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-700">Issuing organization *</label>
              <button
                onClick={() => copyToClipboard("CourseHub Academy", "Issuing organization")}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                Copy
              </button>
            </div>
            <input
              type="text"
              readOnly
              value="CourseHub Academy"
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
            />
          </div>

          {/* Issue Date */}
          <div className="bg-white p-3 rounded border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-700">Issue date *</label>
              <button
                onClick={() => copyToClipboard(new Date(certificateInfo.issuedAt).toLocaleDateString(), "Issue date")}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                Copy
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={new Date(certificateInfo.issuedAt).toLocaleDateString()}
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Month: {new Date(certificateInfo.issuedAt).toLocaleString('default', { month: 'long' })} | 
              Year: {new Date(certificateInfo.issuedAt).getFullYear()}
            </p>
          </div>

          {/* Credential ID */}
          <div className="bg-white p-3 rounded border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-700">Credential ID</label>
              <button
                onClick={() => copyToClipboard(certificateInfo.certificateNumber, "Credential ID")}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                Copy
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={certificateInfo.certificateNumber}
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
            />
          </div>

          {/* Credential URL */}
          <div className="bg-white p-3 rounded border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-700">Credential URL</label>
              <button
                onClick={() => copyToClipboard(window.location.href, "Credential URL")}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                Copy
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs truncate"
            />
          </div>

          {/* Skills Section */}
          {certificateInfo.courseTitle && (
            <div className="bg-white p-3 rounded border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-700">Skills (Add these)</label>
                <button
                  onClick={() => copyToClipboard(certificateInfo.courseTitle, "Skill")}
                  className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                >
                  Copy
                </button>
              </div>
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                <p className="font-medium text-gray-700">{certificateInfo.courseTitle}</p>
                <p className="text-gray-500 text-xs mt-1">Click "+ Add skill" in LinkedIn and add this</p>
              </div>
            </div>
          )}

          {/* Course Description */}
          {certificateInfo.courseDescription && (
            <div className="bg-white p-3 rounded border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-700">Course Description</label>
                <button
                  onClick={() => copyToClipboard(certificateInfo.courseDescription, "Description")}
                  className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                {certificateInfo.courseDescription}
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-100 border border-blue-300 rounded p-3 text-xs text-blue-900">
          <p className="font-semibold mb-2">📋 Steps:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>The LinkedIn form should still be open in a separate window</li>
            <li>Fill in the required fields (*) using the "Copy" buttons above</li>
            <li>Click "+ Add skill" and add the course name as a skill</li>
            <li>Click "Save" to add the certification to your LinkedIn profile</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleLinkedInShare}
    >
      <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
      <div className="text-left">
        <p className="font-medium text-sm">Share on LinkedIn</p>
        <p className="text-xs text-muted-foreground">Add to your certification profile</p>
      </div>
    </Button>
  );
};

// Email Share Button Component
const EmailShareButton = ({ certificateInfo }: { certificateInfo: api.CertificateInfo }) => {
  const handleEmailShare = () => {
    const subject = `I completed "${certificateInfo.courseTitle}" course!`;
    const body = `Hi,\n\nI'm excited to share that I just completed "${certificateInfo.courseTitle}" course!\n\nCertificate Details:\n- Certificate No: ${certificateInfo.certificateNumber}\n- Issued: ${new Date(certificateInfo.issuedAt).toLocaleDateString()}\n- Instructor: ${certificateInfo.instructorName || "N/A"}\n${certificateInfo.percentage > 0 ? `- Score: ${certificateInfo.percentage.toFixed(1)}%\n` : ''}\nBest regards,\n${certificateInfo.studentName}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleEmailShare}
    >
      <Mail className="h-4 w-4 mr-2 text-orange-500" />
      <div className="text-left">
        <p className="font-medium text-sm">Share via Email</p>
        <p className="text-xs text-muted-foreground">Send certificate details to your contacts</p>
      </div>
    </Button>
  );
};

// Copy Share Link Component
const CopyShareLink = ({ certificateInfo }: { certificateInfo: api.CertificateInfo }) => {
  const [copied, setCopied] = useState(false);
  
  const shareLink = `${window.location.href}?cert=${certificateInfo.certificateNumber}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ 
      title: "Link copied!",
      description: "Share this link with others to showcase your certificate"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Copy Share Link</p>
      <div className="flex gap-2">
        <Input
          readOnly
          value={shareLink}
          className="text-xs"
        />
        <Button
          size="sm"
          onClick={handleCopy}
          variant={copied ? "default" : "outline"}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
};

export default CourseDetail;

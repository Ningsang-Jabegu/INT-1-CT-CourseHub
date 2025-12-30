import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Search, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as api from "@/lib/api";

export const VerifyCertificate = () => {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<api.CertificateVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateNumber.trim()) {
      setError("Please enter a certificate number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const verification = await api.verifyCertificate(certificateNumber.trim());
      setResult(verification);
      
      toast({
        title: "Certificate Verified",
        description: "The certificate is valid and active",
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Certificate not found or invalid";
      setError(errorMsg);
      setResult(null);
      
      toast({
        title: "Verification Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-green-100 mb-4">
            <Shield className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Verify Certificate</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Verify the authenticity of any CourseHub certificate using its unique certificate number.
          </p>
        </div>

        {/* Verification Form Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Certificate Number</CardTitle>
            <CardDescription>
              Find the certificate number (e.g., CH-20251230-XXXXXX) on your certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="certNumber" className="text-sm font-medium text-foreground block mb-2">
                  Certificate Number
                </label>
                <div className="flex gap-2">
                  <Input
                    id="certNumber"
                    placeholder="e.g., CH-20251230-ABC123"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    disabled={loading}
                    className="font-mono text-sm"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !certificateNumber.trim()}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Verification Failed</p>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Status Banner */}
            <div className="flex gap-3 p-6 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 text-lg">Certificate is Valid</p>
                <p className="text-sm text-green-800 mt-1">
                  This certificate has been verified and is active in our system
                </p>
              </div>
            </div>

            {/* Certificate Details Card */}
            <Card>
              <CardHeader className="bg-accent/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{result.courseTitle}</CardTitle>
                    <CardDescription className="mt-2">
                      Certificate of Completion
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Student & Course Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Student Name</p>
                    <p className="text-lg font-semibold text-foreground">{result.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Course</p>
                    <p className="text-lg font-semibold text-foreground">{result.courseTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Instructor</p>
                    <p className="text-lg font-semibold text-foreground">
                      {result.instructorName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(result.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Certificate Number */}
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Certificate Number
                  </p>
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {result.certificateNumber}
                  </p>
                </div>

                {/* Course Description */}
                {result.courseDescription && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Course Description</p>
                    <p className="text-foreground leading-relaxed text-sm">
                      {result.courseDescription}
                    </p>
                  </div>
                )}

                {/* Performance Metrics */}
                {result.percentage > 0 && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">Performance</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-blue-800">Score</span>
                          <span className="font-semibold text-blue-900">
                            {result.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(result.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        {result.obtainedScore.toFixed(1)} / {result.totalScore.toFixed(1)} points
                      </p>
                    </div>
                  </div>
                )}

                {/* Verification Info */}
                <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Verification Time:</strong> {new Date(result.verifiedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {result.certificateStatus}
                  </p>
                  <p>
                    <strong>System:</strong> CourseHub Certificate Management
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setCertificateNumber("");
                  setResult(null);
                  setError(null);
                }}
              >
                Verify Another
              </Button>
              <Button
                variant="default"
                onClick={() => window.print()}
              >
                Print Verification
              </Button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How to Verify</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Obtain the certificate number from your certificate PDF</p>
              <p>2. Enter the number in the search box above</p>
              <p>3. Click "Verify" to check authenticity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Certificate Format</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Certificates follow the format:</p>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded">
                CH-YYYYMMDD-XXXXXX
              </p>
              <p>Where XXXXXX is a unique identifier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>If you can't find your certificate number:</p>
              <p>• Check your course completion email</p>
              <p>• Download your certificate PDF</p>
              <p>• Contact support for assistance</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VerifyCertificate;

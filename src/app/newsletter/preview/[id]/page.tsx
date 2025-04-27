"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Smartphone, Tablet, Monitor, Printer, Mail } from "lucide-react";
import { toast } from "sonner";
import { NewsletterElement, SocialLink } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewsletterPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [newsletterName, setNewsletterName] = useState("");
  const [elements, setElements] = useState<NewsletterElement[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailPreviewText, setEmailPreviewText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Load newsletter data
  useEffect(() => {
    const loadNewsletter = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/newsletters/${id}`);

        if (!response.ok) {
          throw new Error("Failed to load newsletter");
        }

        const data = await response.json();

        setNewsletterName(data.name);
        setElements(data.elements);
        setEmailSubject(data.subject || "");
        setEmailPreviewText(data.previewText || "");
      } catch (err: Error | unknown) {
        console.error("Error loading newsletter:", err);
        let errorMessage = "An error occurred loading the newsletter";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
      } finally {
        setLoading(false);
      }
    };

    loadNewsletter();
  }, [id]);

  const handleBackToEditor = () => {
    router.push(`/newsletter/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Handle sending a test email
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@") || !testEmail.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      // This would need a real API endpoint to be implemented
      const response = await fetch(`/api/newsletters/${id}/send-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testEmail,
          subject: emailSubject,
          previewText: emailPreviewText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send test email");
      }

      toast.success(`Test email sent to ${testEmail}`);
      setSendDialogOpen(false);
    } catch (err: Error | unknown) {
      console.error("Error sending test email:", err);
      let errorMessage = "Failed to send test email";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Render a newsletter element with appropriate handling for each type
  const renderElement = (element: NewsletterElement) => {
    switch (element.type) {
      case "heading":
        return <h2 style={element.style}>{element.content}</h2>;
      case "text":
        return <p style={element.style}>{element.content}</p>;
      case "image":
        return element.src ? (
          <img
            src={element.src}
            alt="Newsletter image"
            style={{ display: "block", maxWidth: "100%", ...element.style }}
          />
        ) : null;
      case "button":
        return (
          <div style={{ textAlign: "center" }}>
            <a
              href={element.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                textDecoration: "none",
                borderRadius: "4px",
                color: "#ffffff",
                backgroundColor: "#3b82f6",
                padding: "10px 20px",
                ...element.style,
              }}
            >
              {element.content}
            </a>
          </div>
        );
      case "divider":
        return <hr style={element.style} />;
      case "spacer":
        return <div style={{ height: element.height }} />;
      case "social":
        return (
          <div style={element.style} className="flex justify-center space-x-4">
            {element.socialLinks?.map((link: SocialLink, i: number) => (
              <a
                key={i}
                href={link.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-700"
                title={link.platform}
              >
                {/* Basic icon representation */}
                {link.platform.toLowerCase().startsWith("tw") && <span>TW</span>}
                {link.platform.toLowerCase().startsWith("fa") && <span>FB</span>}
                {link.platform.toLowerCase().startsWith("in") && <span>IN</span>}
                {link.platform.toLowerCase().startsWith("li") && <span>LI</span>}
                {!["tw", "fa", "in", "li"].some((p) =>
                  link.platform.toLowerCase().startsWith(p)
                ) && <span className="uppercase font-bold text-xs">{link.platform.charAt(0)}</span>}
              </a>
            ))}
          </div>
        );
      case "code":
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: element.content || "",
            }}
          />
        );
      case "columns":
        return element.columns ? (
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexDirection: viewMode === "mobile" ? "column" : "row",
              ...element.style,
            }}
          >
            {element.columns.map((column, colIndex) => (
              <div key={colIndex} style={{ flex: 1 }}>
                {column.map((columnElement) => (
                  <div key={columnElement.id} className="my-1">
                    {renderElement(columnElement)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null;
      default:
        return <p>Unsupported element type: {element.type}</p>;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="h-full w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Skeleton className="h-full w-full max-w-2xl rounded-md" />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Newsletter</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push("/dashboard/newsletters")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm print:hidden">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBackToEditor}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Editor
          </Button>
          <div>
            <h1 className="font-medium text-lg">{newsletterName}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Device view mode switcher */}
          <div className="flex border rounded-md mr-2">
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="px-2 h-8 transition-all duration-300"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "tablet" ? "secondary" : "ghost"}
              size="sm"
              className="px-2 h-8 transition-all duration-300"
              onClick={() => setViewMode("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="px-2 h-8 transition-all duration-300"
              onClick={() => setViewMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>

          <Button variant="outline" size="sm" onClick={() => setSendDialogOpen(true)}>
            <Mail className="h-4 w-4 mr-1" />
            Send Test
          </Button>
        </div>
      </div>

      {/* Email subject & preview section */}
      <div className="bg-muted/20 p-4 border-b print:hidden">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Subject:</p>
              <p>{emailSubject || "(No subject)"}</p>
            </div>
            {emailPreviewText && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Preview Text:</p>
                <p>{emailPreviewText}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-6 overflow-auto">
        <div
          className={`bg-white shadow-sm rounded-lg transition-all duration-500 ease-in-out
            ${
              viewMode === "desktop"
                ? "max-w-2xl w-full"
                : viewMode === "tablet"
                  ? "max-w-md w-full"
                  : "max-w-xs w-full"
            }`}
        >
          {/* Newsletter content */}
          <div className="p-6">
            {elements.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                <p>This newsletter has no content.</p>
              </div>
            ) : (
              <div>
                {elements.map((element) => (
                  <div key={element.id} className="my-2">
                    {renderElement(element)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Test Email Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Enter an email address to send a test version of this newsletter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="test-email">Email address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="your-email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTest} disabled={isSending}>
              {isSending ? "Sending..." : "Send Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

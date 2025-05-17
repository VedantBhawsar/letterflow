"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  Smartphone,
  Tablet,
  Monitor,
  Printer,
  Mail,
  Loader2,
  AlertCircle,
  Send, // For test send button
} from "lucide-react";
import { toast } from "sonner";
import { NewsletterElement, SocialLink } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion"; // For subtle animations

// Re-using the RenderNewsletterElementDS from the editor page (or a shared component)
// Assuming it's correctly defined and styled as per the editor page.
// For this example, I'll include a simplified placeholder again.
// It's CRUCIAL that the real RenderNewsletterElement component is used for accurate preview.

interface RenderNewsletterElementPropsDS {
  element: NewsletterElement;
  viewMode: ViewModeOption;
  isSelected?: boolean;
  onSelect?: (elementId: string) => void;
}
function RenderNewsletterElementDS({ element, viewMode }: RenderNewsletterElementPropsDS) {
  // THIS IS A PLACEHOLDER - Use the actual, styled RenderNewsletterElementDS from editor
  const commonStyles: React.CSSProperties = {
    margin: element.style?.margin ?? "0",
    padding: element.style?.padding ?? "0",
    wordBreak: "break-word",
    ...element.style,
  };
  // This rendering logic MUST match the editor's for accurate preview
  switch (element.type) {
    case "heading":
      return (
        <h2 style={{ ...commonStyles, color: commonStyles.color || "#E2E8F0" }}>
          {element.content || "Empty Heading"}
        </h2>
      );
    case "text":
      return (
        <p style={{ ...commonStyles, color: commonStyles.color || "#CBD5E1" }}>
          {element.content || "Empty Text Block"}
        </p>
      );
    case "passage":
      return (
        <div
          style={{
            whiteSpace: "pre-wrap",
            ...commonStyles,
            color: commonStyles.color || "#CBD5E1",
          }}
          dangerouslySetInnerHTML={{
            __html:
              (element.content || "Empty Passage").replace(/\n/g, "<br />") || "Empty Passage",
          }}
        />
      );
    case "image":
      return (
        <img
          src={element.src || "https://placehold.co/100x50/1E293B/94A3B8?text=No+Image"}
          alt={element.alt || "Newsletter image"}
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
            ...commonStyles,
            width: commonStyles.width || "100%",
            borderRadius: commonStyles.borderRadius || "0px",
          }}
        />
      );
    case "button":
      return (
        <table
          border={0}
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ borderCollapse: "collapse" }}
        >
          <tbody>
            <tr>
              <td
                align={(element.style?.textAlign as any) || "center"}
                style={{
                  textAlign: (element.style?.textAlign as any) || "center",
                  padding: "5px 0",
                }}
              >
                <a
                  href={element.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    textDecoration: "none",
                    backgroundColor: commonStyles.backgroundColor || "#10B981",
                    color: commonStyles.color || "#ffffff",
                    padding: commonStyles.padding || "12px 24px",
                    borderRadius: commonStyles.borderRadius || "6px",
                    fontWeight: commonStyles.fontWeight || "500",
                    ...{ ...commonStyles, margin: undefined },
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  {element.content || "Button"}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      );
    case "divider":
      return (
        <div
          style={{
            height: "0px",
            borderTopStyle: element.style?.borderTopStyle || "solid",
            borderTopWidth: (element.style?.borderTopWidth as string) || "1px",
            borderTopColor: (element.style?.borderTopColor as string) || "#334155",
            margin: commonStyles.margin || "24px 0",
          }}
        ></div>
      );
    case "spacer":
      return (
        <div
          style={{
            ...commonStyles,
            height: element.style?.height || element.height || "32px",
            fontSize: "1px",
            lineHeight: "1px",
          }}
        >
           
        </div>
      );
    // Social and Columns would need their specific rendering from the editor
    case "social":
      return (
        <div style={{ textAlign: "center", padding: "10px", color: "#CBD5E1" }}>
          Social Icons Placeholder
        </div>
      );
    case "code":
      return (
        <div
          className="custom-html-preview my-1 overflow-hidden p-2 bg-slate-700 border border-slate-600 rounded-md text-xs"
          title="Custom HTML"
          dangerouslySetInnerHTML={{
            __html: element.content || "<p class='text-slate-500'>[HTML]</p>",
          }}
          style={commonStyles}
        />
      );
    case "columns":
      return (
        <div
          style={{ display: "flex", gap: "10px", border: "1px dashed #475569", padding: "10px" }}
        >
          {element.columns?.map((col, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                borderRight:
                  i < (element.columns?.length || 0) - 1 ? "1px dashed #475569" : undefined,
                paddingRight: "10px",
              }}
            >
              {col.map((el) => (
                <RenderNewsletterElementDS key={el.id} element={el} viewMode={viewMode} />
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return <p className="text-red-400">Unsupported element: {element.type}</p>;
  }
}

type ViewModeOption = "desktop" | "tablet" | "mobile";

const VIEW_MODE_OPTIONS_PREVIEW = [
  { mode: "mobile", icon: Smartphone, label: "Mobile" },
  { mode: "tablet", icon: Tablet, label: "Tablet" },
  { mode: "desktop", icon: Monitor, label: "Desktop" },
] as const;

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
  const [viewMode, setViewMode] = useState<ViewModeOption>("desktop");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadNewsletter = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("Newsletter ID not found.");
        setLoading(false);
        toast.error("Cannot load preview: Newsletter ID missing.");
        return;
      }
      try {
        const response = await fetch(`/api/newsletters/${id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to load newsletter for preview.");
        }
        const data = await response.json();
        setNewsletterName(data.name);
        setElements(data.elements || []);
        setEmailSubject(data.subject || "");
        setEmailPreviewText(data.previewText || "");
      } catch (err: Error | unknown) {
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Error loading newsletter for preview:", err);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    loadNewsletter();
  }, [id]);

  const handleBackToEditor = () => router.push(`/dashboard/newsletters/${id}/edit`);
  const handlePrint = () => window.print();

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@") || !testEmail.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(`/api/newsletters/${id}/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          subject: emailSubject,
          previewText: emailPreviewText,
          elements,
          newsletterId: id,
        }), // Ensure newsletterId is passed
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send test email");
      }
      toast.success(`Test email sent to ${testEmail}`);
      setSendDialogOpen(false);
    } catch (err: Error | unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send test.";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full p-6 flex flex-col bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6 print:hidden">
          <Skeleton className="h-9 w-40 rounded-md bg-slate-800" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24 rounded-md bg-slate-800" />
            <Skeleton className="h-9 w-24 rounded-md bg-slate-800" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-300">
        <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-slate-100 mb-3">Error Loading Preview</h2>
        <p className="text-red-400 mb-8 max-w-md">{error}</p>
        <Button
          onClick={() => router.push("/dashboard/newsletters")}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Go to Newsletters
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-300">
      {/* Header Toolbar - Styled based on DS */}
      <header className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800 shadow-md print:hidden sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToEditor}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/80 h-9 px-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" /> Back to Editor
          </Button>
          <div className="h-6 border-l border-slate-700"></div>
          <h1
            className="font-semibold text-lg text-slate-100 truncate max-w-xs sm:max-w-md"
            title={newsletterName}
          >
            {newsletterName}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex border border-slate-700 rounded-md p-0.5 bg-slate-900">
            {VIEW_MODE_OPTIONS_PREVIEW.map(({ mode, icon: Icon, label }) => (
              <TooltipProvider key={mode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2.5 text-slate-400 hover:text-slate-100 data-[active=true]:bg-slate-700 data-[active=true]:text-emerald-400`}
                      data-active={viewMode === mode}
                      onClick={() => setViewMode(mode as ViewModeOption)}
                    >
                      {" "}
                      <Icon className="h-4 w-4" />{" "}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-slate-700 text-slate-200 border-slate-600"
                  >
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-slate-100 h-9 px-3"
          >
            <Printer className="h-4 w-4 mr-1.5" /> Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSendDialogOpen(true)}
            className="border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-slate-100 h-9 px-3"
          >
            <Send className="h-4 w-4 mr-1.5" /> Send Test
          </Button>
        </div>
      </header>

      {/* Email Subject & Preview Section - Styled based on DS */}
      <div className="bg-slate-800/50 p-4 border-b border-slate-700 print:hidden shadow-sm">
        <div
          className={`max-w-3xl mx-auto transition-all duration-300 ease-in-out ${viewMode === "desktop" ? "max-w-3xl" : viewMode === "tablet" ? "max-w-xl" : "max-w-sm"}`}
        >
          <div className="bg-slate-800 p-3 rounded-md border border-slate-700 shadow">
            <p className="text-xs font-medium text-slate-400 mb-0.5">Subject:</p>
            <p className="text-slate-100 font-medium text-sm">
              {emailSubject || <span className="italic text-slate-500">(No subject)</span>}
            </p>
            {emailPreviewText && (
              <>
                <p className="text-xs font-medium text-slate-400 mt-2 mb-0.5">Preview Text:</p>
                <p className="text-slate-300 text-sm">{emailPreviewText}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Styled based on DS */}
      <main className="flex-1 flex items-start justify-center bg-slate-900 p-4 sm:p-8 overflow-auto custom-scrollbar print:bg-white print:text-black">
        <motion.div
          key={viewMode} // Re-trigger animation on viewMode change
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`bg-white shadow-2xl rounded-lg print:shadow-none print:border-none
            ${
              viewMode === "desktop"
                ? "max-w-3xl w-full"
                : viewMode === "tablet"
                  ? "max-w-xl w-full sm:max-w-2xl md:max-w-md" // Refined tablet widths
                  : "max-w-sm w-full sm:max-w-xs" // Refined mobile widths
            }`}
        >
          <div className="p-0 m-0 newsletter-render-container">
            {" "}
            {/* Email often has no body margin/padding */}
            {elements.length === 0 ? (
              <div className="text-center p-12 text-slate-500 print:text-gray-600">
                <Mail className="h-16 w-16 mx-auto mb-4 text-slate-600 print:text-gray-400" />
                <p className="text-lg font-medium">This newsletter is empty.</p>
                <p className="text-sm">Go back to the editor to add some content.</p>
              </div>
            ) : (
              <div
                className="email-body-wrapper"
                style={{
                  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
                }}
              >
                {/* IMPORTANT: Email rendering needs to be table-based for many clients.
                    RenderNewsletterElementDS should ideally output email-safe HTML.
                    For web preview, direct rendering is fine.
                */}
                {elements.map((element) => (
                  <RenderNewsletterElementDS
                    key={element.id}
                    element={element}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Send Test Email Dialog - Styled based on DS */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-slate-300 rounded-lg">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-slate-100">Send Test Email</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter an email address to send a test version of this newsletter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 pt-1">
            <div className="grid gap-1.5">
              <Label htmlFor="test-email" className="text-slate-300">
                Email address
              </Label>
              <Input
                id="test-email"
                type="email"
                placeholder="recipient@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-300 focus:border-emerald-500"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSendTest}
              disabled={isSending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-70"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Test"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Global Styles for Print and Scrollbar */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          main {
            padding: 0 !important;
          } /* Remove padding for print */
          .newsletter-render-container {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        } /* slate-700 */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        } /* slate-600 */
      `}</style>
    </div>
  );
}

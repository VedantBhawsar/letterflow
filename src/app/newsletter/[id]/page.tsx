"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  Undo,
  Redo,
  ChevronLeft,
  Eye,
  Settings,
  Send,
  Trash2,
  Layout,
  Type,
  Image as ImageIcon,
  Square as ButtonIcon,
  Columns,
  Heading,
  User as PersonalizationIcon,
  Smartphone,
  Tablet,
  Monitor,
  ArrowUpDown,
  Braces,
  Minus as Divider,
  Share2,
  Copy,
  Menu,
  Loader2,
  Mail,
  AlertCircle,
  X,
  SendHorizonal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  newsletterTemplates,
  personalizationOptions,
} from "@/components/newsletters/newsletter-templates";
import { NewsletterElement, SocialLink } from "@/lib/types";
import { Label } from "@/components/ui/label";

// Keep Tooltip fallback components
const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;
const Tooltip = ({ children }: { children: React.ReactNode }) => children;
const TooltipTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) =>
  children;
const TooltipContent = ({ children }: { children: React.ReactNode }) => null;

export default function NewsletterEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const templateType = isNew ? "basic" : "blank";

  const [newsletterName, setNewsletterName] = useState("Loading...");
  const [elements, setElements] = useState<NewsletterElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("elements"); // Default tab
  const builderRef = useRef<HTMLDivElement>(null);

  // State variables for features
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [history, setHistory] = useState<NewsletterElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailPreviewText, setEmailPreviewText] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("draft");
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<null | {
    sentCount: number;
    failedCount: number;
  }>(null);

  // Initialize the newsletter with template data or load existing newsletter
  useEffect(() => {
    const loadNewsletter = async () => {
      setLoading(true);

      // For new newsletters, use the template
      if (isNew) {
        const template =
          newsletterTemplates[templateType as keyof typeof newsletterTemplates] ||
          newsletterTemplates.blank;

        setNewsletterName(`New ${template.name}`);
        setElements(template.elements);
        setHistory([template.elements]);
        setHistoryIndex(0);

        setTimeout(() => setLoading(false), 800);
        return;
      }

      // For existing newsletters, fetch from API
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
        setNewsletterStatus(data.status || "draft");

        // Initialize history with loaded elements
        setHistory([data.elements]);
        setHistoryIndex(0);
      } catch (err: any) {
        console.error("Error loading newsletter:", err);
        toast.error(`Failed to load newsletter: ${err.message}`);
        setError(err.message || "An error occurred loading the newsletter");
      } finally {
        setLoading(false);
      }
    };

    loadNewsletter();
  }, [id, isNew, templateType]);

  // Save current state to history whenever elements change (no changes needed here)
  useEffect(() => {
    if (!loading && history.length > 0 && historyIndex !== -1) {
      // Only add to history if elements have changed and we are not undoing/redoing
      const currentHistoryElement = history[historyIndex];
      if (JSON.stringify(elements) !== JSON.stringify(currentHistoryElement)) {
        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        // Add current state to history
        setHistory([...newHistory, elements]);
        setHistoryIndex(newHistory.length);
      }
    }
    // Added loading dependency to prevent premature history saves
  }, [elements, loading]);

  // Handle undo (no changes needed)
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]); // Apply previous state
      toast.info("Undo successful");
    } else {
      toast.error("Nothing to undo");
    }
  };

  // Handle redo (no changes needed)
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]); // Apply next state
      toast.info("Redo successful");
    } else {
      toast.error("Nothing to redo");
    }
  };

  // Find the selected element in the elements array (no changes needed)
  const findElementById = (
    elementId: string,
    elementsArray: NewsletterElement[]
  ): NewsletterElement | null => {
    for (const element of elementsArray) {
      if (element.id === elementId) {
        return element;
      }
      if (element.type === "columns" && element.columns) {
        for (const column of element.columns) {
          const foundInColumn = findElementById(elementId, column);
          if (foundInColumn) return foundInColumn;
        }
      }
    }
    return null;
  };

  // Get the currently selected element (no changes needed)
  const selectedElementData = selectedElement ? findElementById(selectedElement, elements) : null;

  // Handle adding a new element (no changes needed)
  const handleAddElement = (type: string) => {
    const newId = `${type}-${Date.now()}`;
    let newElement: NewsletterElement = { id: newId, type };

    switch (type) {
      case "text":
        newElement.content = "Add your text here";
        break;
      case "heading":
        newElement.content = "Heading";
        break;
      case "image":
        newElement.src = "https://placehold.co/600x400/e6e6e6/999999?text=Image";
        break;
      case "button":
        newElement.content = "Button";
        newElement.url = "#";
        break;
      case "columns":
        newElement.columns = [
          [
            {
              id: `text-${Date.now()}-1`,
              type: "text",
              content: "Column 1 content",
            },
          ],
          [
            {
              id: `text-${Date.now()}-2`,
              type: "text",
              content: "Column 2 content",
            },
          ],
        ];
        break;
      case "divider":
        newElement.style = { borderTop: "1px solid #e5e7eb", margin: "20px 0" };
        break;
      case "spacer":
        newElement.height = "40px";
        break;
      case "social":
        newElement.socialLinks = [
          { platform: "twitter", url: "#" },
          { platform: "facebook", url: "#" },
          { platform: "instagram", url: "#" },
          { platform: "linkedin", url: "#" },
        ];
        newElement.style = { textAlign: "center", margin: "20px 0" };
        break;
      case "code":
        newElement.content =
          "<div style='padding: 20px; background-color: #f3f4f6;'>Custom HTML here</div>";
        break;
    }

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newId);
    setActiveTab("properties"); // Switch to properties tab after adding

    toast.success(`Added ${type} element`);
  };

  // Handle removing an element (no changes needed)
  const handleRemoveElement = (elementId: string) => {
    setElements((prev) => prev.filter((element) => element.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null); // Deselect if the removed element was selected
    }
    toast.success("Element removed");
  };

  // Handle updating element content (no changes needed)
  const handleElementContentChange = (elementId: string, content: string) => {
    setElements((prev) =>
      prev.map((element) => (element.id === elementId ? { ...element, content } : element))
    );
  };

  // Handle updating element style (no changes needed)
  const handleElementStyleChange = (elementId: string, property: string, value: string) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === elementId
          ? {
              ...element,
              style: {
                ...element.style,
                [property]: value,
              },
            }
          : element
      )
    );
  };

  // Handle adding personalization to a text element (no changes needed)
  const handleAddPersonalization = (elementId: string, fieldId: string) => {
    const field = personalizationOptions.find((option) => option.id === fieldId);
    if (!field) return;

    const elementToUpdate = findElementById(elementId, elements);

    if (!elementToUpdate || !("content" in elementToUpdate)) return;

    const updatedContent = `${elementToUpdate.content || ""} ${field.defaultValue}`;

    setElements((prev) =>
      prev.map((element) =>
        element.id === elementId
          ? {
              ...element,
              content: updatedContent,
              personalizedFields: [
                ...(element.personalizedFields || []),
                { fieldName: field.id, defaultValue: field.defaultValue },
              ],
            }
          : element
      )
    );

    toast.success(`Added ${field.label} personalization`);
  };

  // Handle drag start for adding elements (no changes needed)
  const handleDragStart = (e: React.DragEvent, type: string) => {
    setDraggedItem(type);
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Handle drag over the main drop area (no changes needed)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle drop for adding elements (no changes needed)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      handleAddElement(draggedItem);
      setDraggedItem(null);
    }
  };

  // Handle save newsletter
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Prepare newsletter data to be saved
      const newsletterData = {
        id: id !== "new" ? id : undefined,
        name: newsletterName,
        elements: elements,
        subject: emailSubject,
        previewText: emailPreviewText,
        status: newsletterStatus,
      };

      // Call the newsletter save API endpoint
      const response = await fetch(`/api/newsletters${id !== "new" ? `/${id}` : ""}`, {
        method: id !== "new" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsletterData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors from the API
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Newsletter saved successfully
      toast.success("Newsletter saved successfully!");

      // If it was a new newsletter, redirect to the edit page with the new ID
      if (id === "new" && data.id) {
        router.push(`/newsletter/${data.id}`);
      }
    } catch (error: any) {
      console.error("Newsletter save error:", error);
      const errorMessage = error.message || "An unexpected error occurred while saving newsletter";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle exit editor (no changes needed)
  const handleExit = () => {
    router.push("/dashboard/newsletters"); // Or wherever your list page is
  };

  // Handle duplicating an element (no changes needed)
  const handleDuplicateElement = (elementId: string) => {
    const elementToDuplicate = findElementById(elementId, elements);
    if (!elementToDuplicate) return;

    const duplicatedElement = JSON.parse(JSON.stringify(elementToDuplicate));
    duplicatedElement.id = `${elementToDuplicate.type}-${Date.now()}`;

    const elementIndex = elements.findIndex((e) => e.id === elementId);

    if (elementIndex === -1) return; // Should not happen if elementToDuplicate exists

    const newElements = [...elements];
    newElements.splice(elementIndex + 1, 0, duplicatedElement);

    setElements(newElements);
    setSelectedElement(duplicatedElement.id);
    toast.success("Element duplicated");
  };

  // Handle element drag start for reordering (no changes needed)
  const handleElementDragStart = (e: React.DragEvent, elementId: string) => {
    e.stopPropagation();
    setDraggingElement(elementId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", elementId);
    (e.currentTarget as HTMLElement).classList.add("opacity-50", "border-2", "border-primary");
  };

  // Handle element drag end (no changes needed)
  const handleElementDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingElement(null);
    setDropTargetIndex(null);
    (e.currentTarget as HTMLElement).classList.remove("opacity-50", "border-2", "border-primary");
  };

  // Handle element drag over (no changes needed)
  const handleElementDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  };

  // Handle element drop for reordering (no changes needed)
  const handleElementDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent drop from bubbling to parent drop zone
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || !draggingElement || sourceId !== draggingElement) return;

    const sourceIndex = elements.findIndex((e) => e.id === sourceId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDraggingElement(null);
      setDropTargetIndex(null);
      return; // Element not found or dropped in the same place
    }

    const newElements = [...elements];
    const [movedElement] = newElements.splice(sourceIndex, 1);

    // Adjust target index if source was before target
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;

    newElements.splice(adjustedTargetIndex, 0, movedElement);

    setElements(newElements);
    setDraggingElement(null);
    setDropTargetIndex(null);
    toast.success("Element reordered");
  };

  // Handle send test email
  const handleSendTest = async () => {
    if (!testEmail || !emailSubject) {
      toast.error("Email address and subject are required");
      return;
    }

    setIsSending(true);

    try {
      // Make sure we save the newsletter first
      await handleSave();

      // Prepare the request data
      const requestData = {
        testEmail,
        subject: emailSubject,
        previewText: emailPreviewText,
      };

      // Call the API to send the test email
      const response = await fetch(`/api/newsletters/${id}/send-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      toast.success(`Test email sent to ${testEmail}`);
      setIsSendDialogOpen(false);
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setIsSending(false);
    }
  };

  // Handle delete newsletter
  const handleDeleteNewsletter = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/newsletters/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete newsletter");
      }

      toast.success("Newsletter deleted successfully");
      setIsDeleteDialogOpen(false);
      router.push("/dashboard/newsletters");
    } catch (err: any) {
      console.error("Error deleting newsletter:", err);
      toast.error(err.message || "Failed to delete newsletter");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle publish newsletter to subscribers
  const handlePublishNewsletter = async () => {
    setIsPublishing(true);
    setPublishResult(null);

    try {
      // Make sure newsletter is saved and marked as published first
      if (newsletterStatus !== "published") {
        setNewsletterStatus("published");
        await handleSave();
      }

      // Send to all subscribers
      const response = await fetch(`/api/newsletters/${id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setPublishResult({
        sentCount: data.sentCount,
        failedCount: data.failedCount,
      });

      toast.success(`Newsletter published to ${data.sentCount} subscribers`);
    } catch (error: any) {
      console.error("Error publishing newsletter:", error);
      toast.error(error.message || "Failed to publish newsletter");
    } finally {
      setIsPublishing(false);
    }
  };

  // Render loading state (no changes needed)
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          <Skeleton className="h-full rounded-md" />
          <div className="md:col-span-3">
            <Skeleton className="h-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state if loading failed significantly
  if (error && elements.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Newsletter</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleExit}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header toolbar - Removed "Create" button */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Exit Editor
          </Button>
          <div>
            <Input
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
              className="h-9 font-medium px-2 text-base w-[280px]"
              placeholder="Newsletter name"
            />
          </div>
          {/* Undo/Redo buttons */}
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* Device view mode switcher */}
          <div className="flex border rounded-md">
            {/* Mobile */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "mobile" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 h-8 transition-all duration-300"
                    onClick={() => setViewMode("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mobile view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Tablet */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "tablet" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 h-8 transition-all duration-300"
                    onClick={() => setViewMode("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tablet view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Desktop */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "desktop" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 h-8 transition-all duration-300"
                    onClick={() => setViewMode("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Desktop view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isNew && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete newsletter</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("settings")} // Directly switch to settings
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>Email settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/newsletter/preview/${id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview newsletter</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="animate-pulse mr-1">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </>
            )}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    if (isNew) {
                      toast.warning("Please save the newsletter first");
                      return;
                    }
                    setIsSendDialogOpen(true);
                  }}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send newsletter</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Show error message if save failed */}
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-2 px-4">Error: {error}</div>
      )}

      {/* Email settings modal/tab content */}
      {activeTab === "settings" && (
        <div className="border-b bg-white p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Email Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("elements")} // Close settings, go back to elements/properties
            >
              Close
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Email Subject:</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject line"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Preview Text:</label>
              <Input
                value={emailPreviewText}
                onChange={(e) => setEmailPreviewText(e.target.value)}
                placeholder="Enter email preview text"
              />
              <p className="text-xs text-muted-foreground">
                This text will appear in the inbox preview on most email clients.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Status:</label>
              <Select
                value={newsletterStatus}
                onValueChange={(value) => setNewsletterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Draft newsletters are saved but not visible to subscribers. Published newsletters
                can be sent to subscribers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Removed Create Content Tab */}

      {/* Builder interface */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-0 h-[calc(100vh-64px)]">
        {/* Left sidebar */}
        <div className="bg-muted/30 p-4 overflow-y-auto border-r">
          <Tabs
            // Ensure default value is valid and handle value change
            defaultValue="elements"
            value={activeTab === "settings" ? "elements" : activeTab} // Fallback to elements if settings is active elsewhere
            onValueChange={(value) => {
              if (value === "elements" || value === "properties") {
                setActiveTab(value);
              }
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="space-y-4">
              <div className="text-sm font-medium">Drag or click to add:</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "heading", icon: Heading, label: "Heading" },
                  { type: "text", icon: Type, label: "Text" },
                  { type: "image", icon: ImageIcon, label: "Image" },
                  { type: "button", icon: ButtonIcon, label: "Button" },
                  { type: "columns", icon: Columns, label: "Columns" },
                  { type: "divider", icon: Divider, label: "Divider" },
                  { type: "spacer", icon: ArrowUpDown, label: "Spacer" },
                  { type: "social", icon: Share2, label: "Social" },
                  { type: "code", icon: Braces, label: "HTML" },
                ].map((item) => (
                  <div
                    key={item.type}
                    className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    onClick={() => handleAddElement(item.type)}
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Removed Template Gallery Section */}

              {/* Personalization Section (no changes needed) */}
              <div className="mt-4 border-t pt-4">
                <div className="text-sm font-medium mb-2">Personalization:</div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">
                    Select a text element first, then add personalization fields:
                  </div>
                  {personalizationOptions.map((field) => (
                    <Button
                      key={field.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        if (selectedElement && selectedElementData?.type === "text") {
                          handleAddPersonalization(selectedElement, field.id);
                        } else {
                          toast.error("Select a text element first");
                        }
                      }}
                      disabled={!selectedElement || selectedElementData?.type !== "text"}
                    >
                      <PersonalizationIcon className="h-3 w-3 mr-1" />
                      {field.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Properties Tab (no changes needed in structure, only content logic if required) */}
            <TabsContent value="properties" className="space-y-4">
              {selectedElement && selectedElementData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium capitalize flex items-center">
                      {/* Icon mapping */}
                      <div className="bg-primary/10 p-1 rounded-md mr-2">
                        {selectedElementData.type === "heading" && <Heading className="h-4 w-4" />}
                        {selectedElementData.type === "text" && <Type className="h-4 w-4" />}
                        {selectedElementData.type === "image" && <ImageIcon className="h-4 w-4" />}
                        {selectedElementData.type === "button" && (
                          <ButtonIcon className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "columns" && <Columns className="h-4 w-4" />}
                        {selectedElementData.type === "divider" && <Divider className="h-4 w-4" />}
                        {selectedElementData.type === "spacer" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "social" && <Share2 className="h-4 w-4" />}
                        {selectedElementData.type === "code" && <Braces className="h-4 w-4" />}
                      </div>
                      {selectedElementData.type} Element
                    </div>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={() => handleDuplicateElement(selectedElement)}
                        title="Duplicate Element"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveElement(selectedElement)}
                        title="Remove Element"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Element-specific properties */}
                  {(selectedElementData.type === "text" ||
                    selectedElementData.type === "heading" ||
                    selectedElementData.type === "button") && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Content:</label>
                      {selectedElementData.type === "heading" ? (
                        <Input
                          value={selectedElementData.content || ""}
                          onChange={(e) =>
                            handleElementContentChange(selectedElement, e.target.value)
                          }
                        />
                      ) : (
                        <Textarea
                          value={selectedElementData.content || ""}
                          onChange={(e) =>
                            handleElementContentChange(selectedElement, e.target.value)
                          }
                          rows={4}
                        />
                      )}
                    </div>
                  )}

                  {selectedElementData.type === "button" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">URL:</label>
                      <Input
                        value={selectedElementData.url || ""}
                        onChange={(e) =>
                          setElements((prev) =>
                            prev.map((element) =>
                              element.id === selectedElement
                                ? { ...element, url: e.target.value }
                                : element
                            )
                          )
                        }
                      />
                    </div>
                  )}

                  {selectedElementData.type === "image" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Image URL:</label>
                      <Input
                        value={selectedElementData.src || ""}
                        onChange={(e) =>
                          setElements((prev) =>
                            prev.map((element) =>
                              element.id === selectedElement
                                ? { ...element, src: e.target.value }
                                : element
                            )
                          )
                        }
                      />
                      {selectedElementData.src && (
                        <div className="mt-2 rounded-md overflow-hidden border max-w-[200px] mx-auto">
                          <img
                            src={selectedElementData.src}
                            alt="Preview"
                            className="max-w-full h-auto block"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedElementData.type === "spacer" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Height:</label>
                      <Select
                        value={selectedElementData.height || "40px"}
                        onValueChange={(value) =>
                          setElements((prev) =>
                            prev.map((element) =>
                              element.id === selectedElement
                                ? { ...element, height: value }
                                : element
                            )
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Height" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20px">Small (20px)</SelectItem>
                          <SelectItem value="40px">Medium (40px)</SelectItem>
                          <SelectItem value="60px">Large (60px)</SelectItem>
                          <SelectItem value="80px">X-Large (80px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedElementData.type === "divider" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Style:</label>
                      <Select
                        value={selectedElementData.style?.borderTop || "1px solid #e5e7eb"}
                        onValueChange={(value) =>
                          handleElementStyleChange(selectedElement, "borderTop", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Divider style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1px solid #e5e7eb">Solid</SelectItem>
                          <SelectItem value="1px dashed #e5e7eb">Dashed</SelectItem>
                          <SelectItem value="2px solid #e5e7eb">Thick</SelectItem>
                          <SelectItem value="3px double #e5e7eb">Double</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedElementData.type === "social" && (
                    <div className="space-y-4">
                      {selectedElementData.socialLinks?.map((link: SocialLink, index: number) => (
                        <div key={index} className="space-y-2 border-b pb-2">
                          <label className="text-xs font-medium capitalize">
                            {link.platform} URL:
                          </label>
                          <Input
                            value={link.url || "#"}
                            onChange={(e) => {
                              const newLinks = [...(selectedElementData.socialLinks || [])];
                              newLinks[index] = {
                                ...newLinks[index],
                                url: e.target.value,
                              };
                              setElements((prev) =>
                                prev.map((element) =>
                                  element.id === selectedElement
                                    ? { ...element, socialLinks: newLinks }
                                    : element
                                )
                              );
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedElementData.type === "code" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Custom HTML:</label>
                      <Textarea
                        value={selectedElementData.content || ""}
                        onChange={(e) =>
                          handleElementContentChange(selectedElement, e.target.value)
                        }
                        rows={8}
                        className="font-mono text-xs"
                      />
                      <div className="text-xs text-muted-foreground">
                        Warning: Custom HTML may be stripped by some email clients. Use with
                        caution.
                      </div>
                    </div>
                  )}

                  {/* Styling options */}
                  <div className="space-y-2 border-t pt-2">
                    <label className="text-xs font-medium">Styling:</label>
                    {/* Text/Heading Styles */}
                    {(selectedElementData.type === "text" ||
                      selectedElementData.type === "heading") && (
                      <>
                        {/* ... (Text/Heading styling controls remain the same) ... */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Text Align:</label>
                            <Select
                              value={selectedElementData.style?.textAlign || "left"}
                              onValueChange={(value) =>
                                handleElementStyleChange(selectedElement, "textAlign", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Alignment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-xs">Font Size:</label>
                            <Select
                              value={selectedElementData.style?.fontSize || "16px"}
                              onValueChange={(value) =>
                                handleElementStyleChange(selectedElement, "fontSize", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12px">Small</SelectItem>
                                <SelectItem value="16px">Medium</SelectItem>
                                <SelectItem value="20px">Large</SelectItem>
                                <SelectItem value="24px">X-Large</SelectItem>
                                <SelectItem value="32px">XX-Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Font Weight:</label>
                            <Select
                              value={selectedElementData.style?.fontWeight || "normal"}
                              onValueChange={(value) =>
                                handleElementStyleChange(selectedElement, "fontWeight", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Weight" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-xs">Text Color:</label>
                            <div className="flex space-x-2 mt-1">
                              {["#000000", "#1e40af", "#047857", "#b91c1c", "#4b5563"].map(
                                (color) => (
                                  <div
                                    key={color}
                                    className={`h-5 w-5 rounded-full cursor-pointer ${
                                      selectedElementData.style?.color === color
                                        ? "ring-2 ring-primary"
                                        : ""
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() =>
                                      handleElementStyleChange(selectedElement, "color", color)
                                    }
                                  />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Button Styles */}
                    {selectedElementData.type === "button" && (
                      <>
                        {/* ... (Button styling controls remain the same) ... */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Button Color:</label>
                            <div className="flex space-x-2 mt-1">
                              {["#3b82f6", "#1e40af", "#059669", "#b91c1c", "#4b5563"].map(
                                (color) => (
                                  <div
                                    key={color}
                                    className={`h-5 w-5 rounded-full cursor-pointer ${
                                      selectedElementData.style?.backgroundColor === color
                                        ? "ring-2 ring-primary"
                                        : ""
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() =>
                                      handleElementStyleChange(
                                        selectedElement,
                                        "backgroundColor",
                                        color
                                      )
                                    }
                                  />
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs">Text Color:</label>
                            <div className="flex space-x-2 mt-1">
                              {["#ffffff", "#f3f4f6", "#000000"].map((color) => (
                                <div
                                  key={color}
                                  className={`h-5 w-5 rounded-full cursor-pointer border ${
                                    selectedElementData.style?.color === color
                                      ? "ring-2 ring-primary"
                                      : ""
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() =>
                                    handleElementStyleChange(selectedElement, "color", color)
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Font Weight:</label>
                            <Select
                              value={selectedElementData.style?.fontWeight || "normal"}
                              onValueChange={(value) =>
                                handleElementStyleChange(selectedElement, "fontWeight", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Weight" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-xs">Size:</label>
                            <Select
                              value={selectedElementData.style?.padding || "10px 20px"}
                              onValueChange={(value) =>
                                handleElementStyleChange(selectedElement, "padding", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5px 10px">Small</SelectItem>
                                <SelectItem value="10px 20px">Medium</SelectItem>
                                <SelectItem value="12px 30px">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Image Styles */}
                    {selectedElementData.type === "image" && (
                      <div className="space-y-2">
                        {/* ... (Image styling controls remain the same) ... */}
                        <div>
                          <label className="text-xs">Width:</label>
                          <Select
                            value={selectedElementData.style?.width || "100%"}
                            onValueChange={(value) =>
                              handleElementStyleChange(selectedElement, "width", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Width" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="50%">50%</SelectItem>
                              <SelectItem value="75%">75%</SelectItem>
                              <SelectItem value="100%">100%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs">Alignment:</label>
                          <Select
                            value={selectedElementData.style?.margin || "0"}
                            onValueChange={(value) =>
                              handleElementStyleChange(selectedElement, "margin", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Alignment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Default</SelectItem>
                              <SelectItem value="0 auto">Center</SelectItem>
                              <SelectItem value="0 0 0 auto">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <div className="mb-2 text-2xl">👈</div>
                  <p>Select an element to edit its properties</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main content area (no changes needed in structure) */}
        <div className="md:col-span-4 bg-white p-6 overflow-y-auto flex items-center justify-center">
          <div
            className={`transition-all duration-500 ease-in-out ${
              viewMode === "desktop" ? "max-w-2xl" : viewMode === "tablet" ? "max-w-md" : "max-w-xs"
            } w-full min-h-[500px] border border-dashed rounded-lg flex flex-col relative bg-gray-50 shadow-inner`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            ref={builderRef}
          >
            {/* Device frame indicator */}
            {viewMode !== "desktop" && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center bg-muted text-xs py-1 px-3 rounded-t-md">
                {viewMode === "tablet" ? (
                  <>
                    <Tablet className="h-3 w-3 mr-1" /> Tablet View
                  </>
                ) : (
                  <>
                    <Smartphone className="h-3 w-3 mr-1" /> Mobile View
                  </>
                )}
              </div>
            )}

            {elements.length === 0 && !loading ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Layout className="h-16 w-16 mb-4 text-muted-foreground/60" />
                <h3 className="text-lg font-medium">Newsletter is empty</h3>
                <p className="text-sm mt-1">
                  Drag elements from the left panel to build your newsletter
                </p>
              </div>
            ) : (
              <div className="p-4">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`my-2 relative group cursor-pointer ${
                      selectedElement === element.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:outline hover:outline-dashed hover:outline-muted"
                    } ${
                      dropTargetIndex === index ? "border-t-2 border-primary pt-1" : ""
                    } ${draggingElement === element.id ? "opacity-30" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element.id);
                      setActiveTab("properties");
                    }}
                    draggable
                    onDragStart={(e) => handleElementDragStart(e, element.id)}
                    onDragEnd={handleElementDragEnd}
                    onDragOver={(e) => handleElementDragOver(e, index)}
                    // Add onDragLeave to clear drop target indicator
                    onDragLeave={(e) => {
                      e.preventDefault();
                      if (dropTargetIndex === index) {
                        setDropTargetIndex(null);
                      }
                    }}
                    onDrop={(e) => handleElementDrop(e, index)}
                  >
                    {/* Element controls */}
                    <div
                      className={`absolute top-0 right-0 hidden group-hover:flex bg-white shadow-sm border rounded-bl-md z-10 ${
                        selectedElement === element.id ? "!flex" : ""
                      }`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Duplicate Element"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateElement(element.id);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        title="Remove Element"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveElement(element.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Drag handle */}
                    <div
                      className={`absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-5 hidden group-hover:flex bg-white shadow border rounded-full cursor-move z-10 ${
                        selectedElement === element.id ? "!flex" : "" // Always show for selected
                      }`}
                      title="Drag to reorder"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground"
                        // Prevent default drag behavior on the button itself
                        draggable={false}
                        onMouseDown={(e) => e.stopPropagation()} // Allow parent drag
                      >
                        <Menu className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Render Element Content */}
                    {element.type === "heading" && <h2 style={element.style}>{element.content}</h2>}
                    {element.type === "text" && <p style={element.style}>{element.content}</p>}
                    {element.type === "image" && element.src && (
                      <img
                        src={element.src}
                        alt="Newsletter image"
                        style={{ display: "block", ...element.style }} // Ensure image is block
                      />
                    )}
                    {element.type === "button" && (
                      <div style={{ textAlign: "center" }}>
                        {" "}
                        {/* Wrapper for centering */}
                        <a
                          href={element.url || "#"}
                          target="_blank" // Add target blank for links
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            textDecoration: "none",
                            borderRadius: "4px",
                            color: "#ffffff", // Default text color
                            backgroundColor: "#3b82f6", // Default bg color
                            padding: "10px 20px", // Default padding
                            ...element.style,
                          }}
                          onClick={(e) => e.preventDefault()} // Prevent navigation in editor
                        >
                          {element.content}
                        </a>
                      </div>
                    )}
                    {element.type === "divider" && <hr style={element.style} />}
                    {element.type === "spacer" && <div style={{ height: element.height }} />}
                    {element.type === "social" && (
                      <div style={element.style} className="flex justify-center space-x-4">
                        {element.socialLinks?.map((link: SocialLink, i: number) => (
                          <a
                            key={i}
                            href={link.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.preventDefault()}
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
                            ) && (
                              <span className="uppercase font-bold text-xs">
                                {link.platform.charAt(0)}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                    {element.type === "code" && (
                      <div
                        className="border border-dashed p-2 bg-muted/20 text-xs text-muted-foreground overflow-x-auto"
                        title="Custom HTML Preview (May differ in clients)"
                      >
                        {/* Render a placeholder instead of dangerouslySetInnerHTML for safety/clarity */}
                        <pre>
                          <code>{element.content || "[Custom HTML Code]"}</code>
                        </pre>
                      </div>
                    )}
                    {element.type === "columns" && element.columns && (
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          ...element.style,
                        }}
                      >
                        {element.columns.map((column, colIndex) => (
                          <div key={colIndex} style={{ flex: 1 }}>
                            {/* Render column elements recursively or directly */}
                            {column.map((columnElement) => (
                              <div
                                key={columnElement.id}
                                className={`my-1 relative group cursor-pointer ${
                                  selectedElement === columnElement.id
                                    ? "ring-1 ring-blue-300 ring-offset-1" // Lighter ring for nested
                                    : "hover:outline hover:outline-dashed hover:outline-gray-300"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent selecting the parent column
                                  setSelectedElement(columnElement.id);
                                  setActiveTab("properties");
                                }}
                              >
                                {/* Minimal controls for column elements */}
                                <div className="absolute top-0 right-0 hidden group-hover:flex bg-white shadow-sm border rounded-bl-md z-10">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Implement remove from column logic if needed
                                      toast.warning(
                                        "Removing elements from columns not fully implemented yet."
                                      );
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* Render nested element content */}
                                {columnElement.type === "heading" && (
                                  <h3 style={columnElement.style}>{columnElement.content}</h3>
                                )}
                                {columnElement.type === "text" && (
                                  <p style={columnElement.style}>{columnElement.content}</p>
                                )}
                                {columnElement.type === "image" && columnElement.src && (
                                  <img
                                    src={columnElement.src}
                                    alt="Column image"
                                    style={{
                                      display: "block",
                                      maxWidth: "100%", // Ensure image fits column
                                      ...columnElement.style,
                                    }}
                                  />
                                )}
                                {/* Add other nested element types if needed */}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Test Email Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify how your newsletter will look before publishing it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter recipient email"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The test email will be sent with subject:{" "}
                <span className="font-medium">{emailSubject}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTest} disabled={isSending || !testEmail}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish to Subscribers Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Newsletter</DialogTitle>
            <DialogDescription>
              This will send your newsletter to all active subscribers. Make sure you've tested it
              first.
            </DialogDescription>
          </DialogHeader>

          {publishResult ? (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-primary/10 rounded-md">
                <h3 className="font-medium text-center">Newsletter Published!</h3>
                <div className="mt-2 flex justify-center space-x-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{publishResult.sentCount}</p>
                    <p className="text-sm text-muted-foreground">Sent</p>
                  </div>
                  {publishResult.failedCount > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-destructive">
                        {publishResult.failedCount}
                      </p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <p className="text-sm">
                  You're about to publish <span className="font-medium">{newsletterName}</span> with
                  subject: <span className="font-medium">{emailSubject}</span>
                </p>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    This action will send your newsletter to all active subscribers immediately.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              {publishResult ? "Close" : "Cancel"}
            </Button>
            {!publishResult && (
              <Button variant="default" onClick={handlePublishNewsletter} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Publish to Subscribers
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Newsletter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{newsletterName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNewsletter} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

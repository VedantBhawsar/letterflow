"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Save,
  Undo,
  Redo,
  ChevronLeft,
  Eye,
  Settings,
  Send,
  X,
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  newsletterTemplates,
  personalizationOptions,
} from "@/components/newsletters/newsletter-templates";
import { NewsletterElement, SocialLink } from "@/lib/types";

// Tooltip fallback components (keep as is)
const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;
const Tooltip = ({ children }: { children: React.ReactNode }) => children;
const TooltipTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) =>
  children;
const TooltipContent = ({ children }: { children: React.ReactNode }) => null;

import { Suspense } from "react";

export default function NewsletterCreatePage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <NewsletterCreateContent />
    </Suspense>
  );
}

function NewsletterCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateType = searchParams.get("template") || "blank";

  const [newsletterName, setNewsletterName] = useState("");
  const [elements, setElements] = useState<NewsletterElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("elements");
  const builderRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [history, setHistory] = useState<NewsletterElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  // State for subject and preview text (already exists)
  const [emailSubject, setEmailSubject] = useState("");
  const [emailPreviewText, setEmailPreviewText] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("draft");
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);
  const [newsletterId, setNewsletterId] = useState<string | null>(null);

  // Initialize the newsletter with template data
  useEffect(() => {
    setLoading(true);
    setError(null);
    const templateKey = templateType as keyof typeof newsletterTemplates;

    if (newsletterTemplates[templateKey]) {
      const template = newsletterTemplates[templateKey];
      setNewsletterName(`New ${template.name || "Newsletter"}`);
      setElements(template.elements);
      setHistory([template.elements]);
      setHistoryIndex(0);
    } else {
      toast.error(`Template "${templateType}" not found. Using blank template.`);
      setNewsletterName("New Blank Newsletter");
      setElements(newsletterTemplates.blank.elements);
      setHistory([newsletterTemplates.blank.elements]);
      setHistoryIndex(0);
      setError(`Template "${templateType}" not found.`);
    }

    // Reset fields for new creation
    setEmailSubject("");
    setEmailPreviewText("");
    setSelectedElement(null);
    setActiveTab("elements");
    setHasSavedOnce(false);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [templateType]);

  // Save current state to history (no changes needed)
  useEffect(() => {
    if (!loading && history.length > 0 && historyIndex !== -1) {
      const currentHistoryElement = history[historyIndex];
      if (JSON.stringify(elements) !== JSON.stringify(currentHistoryElement)) {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, elements]);
        setHistoryIndex(newHistory.length);
      }
    }
  }, [elements, loading, history, historyIndex]);

  // Undo/Redo handlers (no changes needed)
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      toast.info("Undo successful");
    } else {
      toast.error("Nothing to undo");
    }
  };
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      toast.info("Redo successful");
    } else {
      toast.error("Nothing to redo");
    }
  };

  // Element manipulation functions (findElementById, handleAddElement, handleRemoveElement, etc.)
  // remain the same as in the previous "create" version.
  // ... (Keep all element handling functions: findElementById, handleAddElement, handleRemoveElement, handleElementContentChange, handleElementStyleChange, handleAddPersonalization) ...
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
    const newElement: NewsletterElement = { id: newId, type };

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
    setActiveTab("properties");

    toast.success(`Added ${type} element`);
  };

  // Handle removing an element (no changes needed)
  const handleRemoveElement = (elementId: string) => {
    setElements((prev) => prev.filter((element) => element.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
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

  // Drag and Drop handlers (handleDragStart, handleDragOver, handleDrop)
  // remain the same as in the previous "create" version.
  // ... (Keep drag/drop handlers: handleDragStart, handleDragOver, handleDrop) ...
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

  // Handle save newsletter (POST request, includes subject/preview)
  const handleSave = async () => {
    if (hasSavedOnce) {
      toast.warning("Newsletter already saved. Please edit from the dashboard.");
      return;
    }
    setIsSaving(true);
    setError(null);

    // Basic validation
    if (!newsletterName.trim()) {
      toast.error("Please enter a newsletter name.");
      setError("Newsletter name is required.");
      setIsSaving(false);
      return;
    }
    if (!emailSubject.trim()) {
      toast.error("Please enter an email subject.");
      setError("Email subject is required.");
      setActiveTab("settings"); // Switch to settings tab
      setIsSaving(false);
      return;
    }

    try {
      const newsletterData = {
        name: newsletterName,
        elements: elements,
        subject: emailSubject, // Include subject
        previewText: emailPreviewText, // Include preview text
        status: newsletterStatus, // Include status
      };

      const response = await fetch(`/api/newsletters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsletterData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      setNewsletterId(data.id);
      setHasSavedOnce(true);
      toast.success("Newsletter created successfully!");

      if (data.id) {
        router.push(`/newsletter/${data.id}`);
      } else {
        toast.warning("Newsletter created, but could not redirect to edit page.");
        router.push("/dashboard/newsletters");
      }
    } catch (error: Error | unknown) {
      console.error("Newsletter save error:", error);
      let errorMessage = "An unexpected error occurred while saving newsletter";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle exit/back (no changes needed)
  const handleExit = () => {
    router.push("/dashboard/newsletters");
  };

  // Duplicate and Reorder handlers (handleDuplicateElement, handleElementDragStart, etc.)
  // remain the same as in the previous "create" version.
  // ... (Keep duplicate/reorder handlers: handleDuplicateElement, handleElementDragStart, handleElementDragEnd, handleElementDragOver, handleElementDrop) ...
  // Handle duplicating an element (no changes needed)
  const handleDuplicateElement = (elementId: string) => {
    const elementToDuplicate = findElementById(elementId, elements);
    if (!elementToDuplicate) return;

    const duplicatedElement = JSON.parse(JSON.stringify(elementToDuplicate));
    duplicatedElement.id = `${elementToDuplicate.type}-${Date.now()}`;

    const elementIndex = elements.findIndex((e) => e.id === elementId);
    if (elementIndex === -1) return;

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
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || !draggingElement || sourceId !== draggingElement) return;

    const sourceIndex = elements.findIndex((e) => e.id === sourceId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDraggingElement(null);
      setDropTargetIndex(null);
      return;
    }

    const newElements = [...elements];
    const [movedElement] = newElements.splice(sourceIndex, 1);
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    newElements.splice(adjustedTargetIndex, 0, movedElement);

    setElements(newElements);
    setDraggingElement(null);
    setDropTargetIndex(null);
    toast.success("Element reordered");
  };

  // Render loading state (no changes needed)
  if (loading) {
    return (
      <div className="h-full w-full p-6 space-y-6">
        {/* ... Skeleton UI ... */}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          <Skeleton className="h-full rounded-md" />
          <div className="md:col-span-4">
            <Skeleton className="h-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        {/* ... (Header content remains the same as previous create version) ... */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleExit}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Newsletters
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "tablet" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 h-8"
                    onClick={() => setViewMode("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tablet view</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "desktop" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 h-8"
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
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
                  onClick={() => {
                    if (hasSavedOnce) {
                      router.push(`/newsletter/preview/${newsletterId}`);
                    } else {
                      toast.warning("Save the newsletter first to preview it");
                    }
                  }}
                  disabled={!hasSavedOnce}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview newsletter</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || hasSavedOnce} // Disable if saving or already saved
            title={hasSavedOnce ? "Newsletter already saved" : "Save newsletter"}
          >
            {isSaving ? (
              <>
                <span className="animate-pulse mr-1">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Newsletter
              </>
            )}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => toast.info("Send functionality not implemented yet")}
                  disabled={!hasSavedOnce} // Can only send after initial save
                  title={!hasSavedOnce ? "Save the newsletter first" : "Send newsletter"}
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

      {/* Email settings section */}
      {activeTab === "settings" && (
        <div className="border-b bg-white p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Email Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("elements")} // Close settings
            >
              Close
            </Button>
          </div>
          {/* Grid layout for inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Subject Input */}
            <div className="space-y-2">
              <label htmlFor="emailSubject" className="text-xs font-medium">
                Email Subject: <span className="text-destructive">*</span>
              </label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject line"
                required // HTML5 required attribute
              />
            </div>
            {/* Preview Text Input */}
            <div className="space-y-2">
              <label htmlFor="emailPreviewText" className="text-xs font-medium">
                Preview Text:
              </label>
              <Input
                id="emailPreviewText"
                value={emailPreviewText}
                onChange={(e) => setEmailPreviewText(e.target.value)}
                placeholder="Enter email preview text (optional)"
              />
              <p className="text-xs text-muted-foreground">
                This text appears after the subject line in many email clients.
              </p>
            </div>
            {/* Newsletter Status */}
            <div className="space-y-2">
              <label htmlFor="newsletterStatus" className="text-xs font-medium">
                Status:
              </label>
              <Select
                value={newsletterStatus}
                onValueChange={(value) => setNewsletterStatus(value)}
              >
                <SelectTrigger id="newsletterStatus">
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

      {/* Builder interface */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-0 h-[calc(100vh-64px)]">
        {/* Left sidebar */}
        <div className="bg-muted/30 p-4 overflow-y-auto border-r">
          {/* ... (Tabs and Sidebar content remains the same as previous create version) ... */}
          <Tabs
            defaultValue="elements"
            value={activeTab === "settings" ? "elements" : activeTab}
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

              {/* Personalization Section */}
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

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-4">
              {selectedElement && selectedElementData ? (
                <div className="space-y-4">
                  {/* ... (Properties content remains largely the same as the edit version) ... */}
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
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveElement(selectedElement)}
                        title="Remove Element"
                      >
                        <Trash2 className="h-4 w-4" />
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

        {/* Main content area */}
        <div className="md:col-span-4 bg-white p-6 overflow-y-auto flex items-center justify-center">
          {/* ... (Main content rendering remains the same as previous create version) ... */}
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

            {elements.length === 0 ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Layout className="h-16 w-16 mb-4 text-muted-foreground/60" />
                <h3 className="text-lg font-medium">Your newsletter is empty</h3>
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
                        selectedElement === element.id ? "!flex" : ""
                      }`}
                      title="Drag to reorder"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground"
                        draggable={false}
                        onMouseDown={(e) => e.stopPropagation()}
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
                        style={{ display: "block", ...element.style }}
                      />
                    )}
                    {element.type === "button" && (
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
                          onClick={(e) => e.preventDefault()}
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
                            {column.map((columnElement) => (
                              <div
                                key={columnElement.id}
                                className={`my-1 relative group cursor-pointer ${
                                  selectedElement === columnElement.id
                                    ? "ring-1 ring-blue-300 ring-offset-1"
                                    : "hover:outline hover:outline-dashed hover:outline-gray-300"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                      maxWidth: "100%",
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
    </div>
  );
}

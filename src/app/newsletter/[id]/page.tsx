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

// Create a simple tooltip component as a fallback
const TooltipProvider = ({ children }: { children: React.ReactNode }) =>
  children;
const Tooltip = ({ children }: { children: React.ReactNode }) => children;
const TooltipTrigger = ({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) => children;
const TooltipContent = ({ children }: { children: React.ReactNode }) => null;

export default function NewsletterEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  // Get template from query params if it's a new newsletter
  const templateType = isNew ? "basic" : "blank"; // Default to basic for new newsletters

  const [newsletterName, setNewsletterName] = useState(
    `New ${
      newsletterTemplates[templateType as keyof typeof newsletterTemplates]
        ?.name || "Newsletter"
    }`
  );
  const [elements, setElements] = useState<NewsletterElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("elements");
  const builderRef = useRef<HTMLDivElement>(null);

  // New state variables for added features
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [history, setHistory] = useState<NewsletterElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailPreviewText, setEmailPreviewText] = useState("");
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Initialize the newsletter with template data
  useEffect(() => {
    if (
      templateType &&
      newsletterTemplates[templateType as keyof typeof newsletterTemplates]
    ) {
      const template =
        newsletterTemplates[templateType as keyof typeof newsletterTemplates];
      setElements(template.elements);
      // Initialize history with the template elements
      setHistory([template.elements]);
      setHistoryIndex(0);
    }

    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [templateType]);

  // Save current state to history whenever elements change
  useEffect(() => {
    if (elements.length > 0 && historyIndex !== -1) {
      // Only add to history if elements have changed
      if (JSON.stringify(elements) !== JSON.stringify(history[historyIndex])) {
        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        // Add current state to history
        setHistory([...newHistory, elements]);
        setHistoryIndex(newHistory.length);
      }
    }
  }, [elements]);

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      toast.info("Undo successful");
    } else {
      toast.error("Nothing to undo");
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      toast.info("Redo successful");
    } else {
      toast.error("Nothing to redo");
    }
  };

  // Find the selected element in the elements array
  const findElementById = (
    id: string,
    elementsArray: NewsletterElement[]
  ): NewsletterElement | null => {
    for (const element of elementsArray) {
      if (element.id === id) {
        return element;
      }
      // Check if element has columns
      if (element.type === "columns" && element.columns) {
        for (const column of element.columns) {
          for (const columnElement of column) {
            if (columnElement.id === id) {
              return columnElement;
            }
          }
        }
      }
    }
    return null;
  };

  // Get the currently selected element
  const selectedElementData = selectedElement
    ? findElementById(selectedElement, elements)
    : null;

  // Handle adding a new element
  const handleAddElement = (type: string) => {
    const id = `${type}-${Date.now()}`;
    let newElement: NewsletterElement = { id, type };

    switch (type) {
      case "text":
        newElement.content = "Add your text here";
        break;
      case "heading":
        newElement.content = "Heading";
        break;
      case "image":
        newElement.src =
          "https://placehold.co/600x400/e6e6e6/999999?text=Image";
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
    setSelectedElement(id);
    setActiveTab("properties");

    toast.success(`Added ${type} element`);
  };

  // Handle removing an element
  const handleRemoveElement = (id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id));
    setSelectedElement(null);

    toast.success("Element removed");
  };

  // Handle updating element content
  const handleElementContentChange = (id: string, content: string) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, content } : element
      )
    );
  };

  // Handle updating element style
  const handleElementStyleChange = (
    id: string,
    property: string,
    value: string
  ) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id
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

  // Handle adding personalization to a text element
  const handleAddPersonalization = (id: string, fieldId: string) => {
    const field = personalizationOptions.find(
      (option) => option.id === fieldId
    );
    if (!field) return;

    const elementToUpdate = findElementById(id, elements);

    if (!elementToUpdate || !("content" in elementToUpdate)) return;

    // Add the personalization field to the content
    const updatedContent = `${elementToUpdate.content} ${field.defaultValue}`;

    // Update the element
    setElements((prev) =>
      prev.map((element) =>
        element.id === id
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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, type: string) => {
    setDraggedItem(type);
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      handleAddElement(draggedItem);
      setDraggedItem(null);
    }
  };

  // Handle save newsletter
  const handleSave = () => {
    // In a real implementation, this would save to an API
    toast.success("Newsletter saved successfully");
    router.push("/dashboard/newsletters");
  };

  // Handle exit editor
  const handleExit = () => {
    router.push("/dashboard/newsletters");
  };

  // Handle duplicating an element
  const handleDuplicateElement = (id: string) => {
    const elementToDuplicate = findElementById(id, elements);
    if (!elementToDuplicate) return;

    // Create a deep copy of the element with a new ID
    const duplicatedElement = JSON.parse(JSON.stringify(elementToDuplicate));
    duplicatedElement.id = `${elementToDuplicate.type}-${Date.now()}`;

    // Find the index of the original element
    const elementIndex = elements.findIndex((e) => e.id === id);

    // Insert the duplicated element after the original element
    const newElements = [...elements];
    newElements.splice(elementIndex + 1, 0, duplicatedElement);

    setElements(newElements);
    setSelectedElement(duplicatedElement.id);
    toast.success("Element duplicated");
  };

  // Handle element drag start for reordering
  const handleElementDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggingElement(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);

    // Add some styling to the dragged element
    const element = e.currentTarget as HTMLElement;
    element.classList.add("opacity-50", "border-2", "border-primary");
  };

  // Handle element drag end
  const handleElementDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingElement(null);
    setDropTargetIndex(null);

    // Remove styling
    const element = e.currentTarget as HTMLElement;
    element.classList.remove("opacity-50", "border-2", "border-primary");
  };

  // Handle element drag over
  const handleElementDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  };

  // Handle element drop for reordering
  const handleElementDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || !draggingElement) return;

    // Find the source element
    const sourceIndex = elements.findIndex((e) => e.id === sourceId);
    if (sourceIndex === -1) return;

    // Create a new array with the reordered elements
    const newElements = [...elements];
    const [movedElement] = newElements.splice(sourceIndex, 1);
    newElements.splice(targetIndex, 0, movedElement);

    setElements(newElements);
    setDraggingElement(null);
    setDropTargetIndex(null);
    toast.success("Element reordered");
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          <Skeleton className="h-full rounded-md" />
          <div className="md:col-span-3">
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "mobile" ? "secondary" : "ghost"}
                    size="sm"
                    className="px-2 h-8"
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveTab(activeTab === "create" ? "elements" : "create")
                  }
                >
                  <Layout className="h-4 w-4 mr-1" />
                  Create
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create new content</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveTab(
                      activeTab === "settings" ? "elements" : "settings"
                    )
                  }
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
                  onClick={() => toast.info("Preview mode not implemented yet")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview newsletter</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    toast.info("Send functionality not implemented yet")
                  }
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

      {/* Email settings modal/tab content */}
      {activeTab === "settings" && (
        <div className="border-b bg-white p-4 space-y-4">
          <h3 className="text-sm font-medium">Email Settings</h3>
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
                This text will appear in the inbox preview on most email
                clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create content tab */}
      {activeTab === "create" && (
        <div className="border-b bg-white p-4 space-y-4">
          <h3 className="text-sm font-medium">Create Content</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium">Basic Elements</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "heading", icon: Heading, label: "Heading" },
                  { type: "text", icon: Type, label: "Text" },
                  { type: "image", icon: ImageIcon, label: "Image" },
                  { type: "button", icon: ButtonIcon, label: "Button" },
                ].map((item) => (
                  <div
                    key={item.type}
                    className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      handleAddElement(item.type);
                      setActiveTab("elements");
                    }}
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium">Layout Elements</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "columns", icon: Columns, label: "Columns" },
                  { type: "divider", icon: Divider, label: "Divider" },
                  { type: "spacer", icon: ArrowUpDown, label: "Spacer" },
                  { type: "code", icon: Braces, label: "HTML" },
                ].map((item) => (
                  <div
                    key={item.type}
                    className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      handleAddElement(item.type);
                      setActiveTab("elements");
                    }}
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium">Social Elements</div>
              <div className="grid grid-cols-2 gap-2">
                {[{ type: "social", icon: Share2, label: "Social Links" }].map(
                  (item) => (
                    <div
                      key={item.type}
                      className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        handleAddElement(item.type);
                        setActiveTab("elements");
                      }}
                    >
                      <item.icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{item.label}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium">Templates</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(newsletterTemplates)
                  .slice(0, 4)
                  .map(([key, template]) => (
                    <div
                      key={key}
                      className="border rounded-md p-2 cursor-pointer hover:border-primary"
                      onClick={() => {
                        setElements(template.elements);
                        setActiveTab("elements");
                        toast.success(`Applied ${template.name} template`);
                      }}
                    >
                      <div className="h-16 bg-muted rounded-md mb-1 flex items-center justify-center">
                        <Layout className="h-6 w-6 text-muted-foreground/60" />
                      </div>
                      <p className="text-xs text-center">{template.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("elements")}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Builder interface */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-0 h-[calc(100vh-64px)]">
        {/* Left sidebar */}
        <div className="bg-muted/30 p-4 overflow-y-auto border-r">
          <Tabs
            defaultValue="elements"
            value={activeTab === "settings" ? "elements" : activeTab}
            onValueChange={setActiveTab}
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

              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-medium mb-2">Templates:</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setTemplateGalleryOpen(true)}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Template Gallery
                </Button>

                {templateGalleryOpen && (
                  <div className="mt-2 border rounded-md p-2 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Select a template</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setTemplateGalleryOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(newsletterTemplates).map(
                        ([key, template]) => (
                          <div
                            key={key}
                            className="border rounded-md p-2 cursor-pointer hover:border-primary"
                            onClick={() => {
                              setElements(template.elements);
                              setTemplateGalleryOpen(false);
                              toast.success(
                                `Applied ${template.name} template`
                              );
                            }}
                          >
                            <div className="h-20 bg-muted rounded-md mb-1 flex items-center justify-center">
                              <Layout className="h-8 w-8 text-muted-foreground/60" />
                            </div>
                            <p className="text-xs text-center">
                              {template.name}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Personalization:</div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">
                    Select a text element first, then add personalization
                    fields:
                  </div>

                  {personalizationOptions.map((field) => (
                    <Button
                      key={field.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        if (
                          selectedElement &&
                          selectedElementData?.type === "text"
                        ) {
                          handleAddPersonalization(selectedElement, field.id);
                        } else {
                          toast.error("Select a text element first");
                        }
                      }}
                      disabled={
                        !selectedElement || selectedElementData?.type !== "text"
                      }
                    >
                      <PersonalizationIcon className="h-3 w-3 mr-1" />
                      {field.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              {selectedElement && selectedElementData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium capitalize flex items-center">
                      <div className="bg-primary/10 p-1 rounded-md mr-2">
                        {selectedElementData.type === "heading" && (
                          <Heading className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "text" && (
                          <Type className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "image" && (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "button" && (
                          <ButtonIcon className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "columns" && (
                          <Columns className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "divider" && (
                          <Divider className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "spacer" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "social" && (
                          <Share2 className="h-4 w-4" />
                        )}
                        {selectedElementData.type === "code" && (
                          <Braces className="h-4 w-4" />
                        )}
                      </div>
                      {selectedElementData.type} Element
                    </div>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={() => handleDuplicateElement(selectedElement)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveElement(selectedElement)}
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
                            handleElementContentChange(
                              selectedElement,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <Textarea
                          value={selectedElementData.content || ""}
                          onChange={(e) =>
                            handleElementContentChange(
                              selectedElement,
                              e.target.value
                            )
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
                      <div className="mt-2 rounded-md overflow-hidden border">
                        <img
                          src={selectedElementData.src}
                          alt="Preview"
                          className="max-w-full h-auto"
                        />
                      </div>
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
                        value={
                          selectedElementData.style?.borderTop ||
                          "1px solid #e5e7eb"
                        }
                        onValueChange={(value) =>
                          handleElementStyleChange(
                            selectedElement,
                            "borderTop",
                            value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Divider style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1px solid #e5e7eb">
                            Solid
                          </SelectItem>
                          <SelectItem value="1px dashed #e5e7eb">
                            Dashed
                          </SelectItem>
                          <SelectItem value="2px solid #e5e7eb">
                            Thick
                          </SelectItem>
                          <SelectItem value="3px double #e5e7eb">
                            Double
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedElementData.type === "social" && (
                    <div className="space-y-4">
                      {selectedElementData.socialLinks?.map(
                        (link: SocialLink, index: number) => (
                          <div key={index} className="space-y-2 border-b pb-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium capitalize">
                                {link.platform}:
                              </label>
                            </div>
                            <Input
                              value={link.url || "#"}
                              onChange={(e) => {
                                const newLinks = [
                                  ...(selectedElementData.socialLinks || []),
                                ];
                                newLinks[index].url = e.target.value;
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
                        )
                      )}
                    </div>
                  )}

                  {selectedElementData.type === "code" && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Custom HTML:
                      </label>
                      <Textarea
                        value={selectedElementData.content || ""}
                        onChange={(e) =>
                          handleElementContentChange(
                            selectedElement,
                            e.target.value
                          )
                        }
                        rows={8}
                        className="font-mono text-xs"
                      />
                      <div className="text-xs text-muted-foreground">
                        Warning: Custom HTML may be stripped by some email
                        clients.
                      </div>
                    </div>
                  )}

                  {/* Styling options */}
                  <div className="space-y-2 border-t pt-2">
                    <label className="text-xs font-medium">Styling:</label>

                    {(selectedElementData.type === "text" ||
                      selectedElementData.type === "heading") && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Text Align:</label>
                            <Select
                              value={
                                selectedElementData.style?.textAlign || "left"
                              }
                              onValueChange={(value) =>
                                handleElementStyleChange(
                                  selectedElement,
                                  "textAlign",
                                  value
                                )
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
                              value={
                                selectedElementData.style?.fontSize || "16px"
                              }
                              onValueChange={(value) =>
                                handleElementStyleChange(
                                  selectedElement,
                                  "fontSize",
                                  value
                                )
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
                              value={
                                selectedElementData.style?.fontWeight ||
                                "normal"
                              }
                              onValueChange={(value) =>
                                handleElementStyleChange(
                                  selectedElement,
                                  "fontWeight",
                                  value
                                )
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
                              {[
                                "#000000",
                                "#1e40af",
                                "#047857",
                                "#b91c1c",
                                "#4b5563",
                              ].map((color) => (
                                <div
                                  key={color}
                                  className={`h-5 w-5 rounded-full cursor-pointer ${
                                    selectedElementData.style?.color === color
                                      ? "ring-2 ring-primary"
                                      : ""
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() =>
                                    handleElementStyleChange(
                                      selectedElement,
                                      "color",
                                      color
                                    )
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElementData.type === "button" && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Button Color:</label>
                            <div className="flex space-x-2 mt-1">
                              {[
                                "#3b82f6",
                                "#1e40af",
                                "#059669",
                                "#b91c1c",
                                "#4b5563",
                              ].map((color) => (
                                <div
                                  key={color}
                                  className={`h-5 w-5 rounded-full cursor-pointer ${
                                    selectedElementData.style
                                      ?.backgroundColor === color
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
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs">Text Color:</label>
                            <div className="flex space-x-2 mt-1">
                              {["#ffffff", "#f3f4f6", "#000000"].map(
                                (color) => (
                                  <div
                                    key={color}
                                    className={`h-5 w-5 rounded-full cursor-pointer border ${
                                      selectedElementData.style?.color === color
                                        ? "ring-2 ring-primary"
                                        : ""
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() =>
                                      handleElementStyleChange(
                                        selectedElement,
                                        "color",
                                        color
                                      )
                                    }
                                  />
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Font Weight:</label>
                            <Select
                              value={
                                selectedElementData.style?.fontWeight ||
                                "normal"
                              }
                              onValueChange={(value) =>
                                handleElementStyleChange(
                                  selectedElement,
                                  "fontWeight",
                                  value
                                )
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
                              value={
                                selectedElementData.style?.padding ||
                                "10px 20px"
                              }
                              onValueChange={(value) =>
                                handleElementStyleChange(
                                  selectedElement,
                                  "padding",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5px 10px">Small</SelectItem>
                                <SelectItem value="10px 20px">
                                  Medium
                                </SelectItem>
                                <SelectItem value="12px 30px">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElementData.type === "image" && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs">Width:</label>
                          <Select
                            value={selectedElementData.style?.width || "100%"}
                            onValueChange={(value) =>
                              handleElementStyleChange(
                                selectedElement,
                                "width",
                                value
                              )
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
                              handleElementStyleChange(
                                selectedElement,
                                "margin",
                                value
                              )
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
          <div
            className={`${
              viewMode === "desktop"
                ? "max-w-2xl"
                : viewMode === "tablet"
                ? "max-w-md"
                : "max-w-xs"
            } w-full min-h-[500px] border border-dashed rounded-lg flex flex-col relative`}
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
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
                <Layout className="h-16 w-16 mb-4 text-muted-foreground/60" />
                <h3 className="text-lg font-medium">
                  Your newsletter is empty
                </h3>
                <p className="text-sm mt-1">
                  Drag elements from the left panel to build your newsletter
                </p>
              </div>
            ) : (
              <div className="p-4">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`my-2 relative group ${
                      selectedElement === element.id
                        ? "ring-2 ring-primary"
                        : "hover:outline hover:outline-muted"
                    } ${
                      dropTargetIndex === index
                        ? "border-t-2 border-primary"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element.id);
                      setActiveTab("properties");
                    }}
                    draggable
                    onDragStart={(e) => handleElementDragStart(e, element.id)}
                    onDragEnd={handleElementDragEnd}
                    onDragOver={(e) => handleElementDragOver(e, index)}
                    onDrop={(e) => handleElementDrop(e, index)}
                  >
                    {/* Element controls that appear on hover */}
                    <div className="absolute top-0 right-0 hidden group-hover:flex bg-white shadow-sm border rounded-bl-md z-10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveElement(element.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Drag handle */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 hidden group-hover:flex bg-white shadow border rounded-full cursor-move">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground"
                      >
                        <Menu className="h-3 w-3" />
                      </Button>
                    </div>

                    {element.type === "heading" && (
                      <h2 style={element.style}>{element.content}</h2>
                    )}

                    {element.type === "text" && (
                      <p style={element.style}>{element.content}</p>
                    )}

                    {element.type === "image" && (
                      <img
                        src={element.src}
                        alt="Newsletter image"
                        style={element.style}
                      />
                    )}

                    {element.type === "button" && (
                      <a
                        href={element.url}
                        style={{
                          display: "inline-block",
                          textDecoration: "none",
                          borderRadius: "4px",
                          ...element.style,
                        }}
                        onClick={(e) => e.preventDefault()}
                      >
                        {element.content}
                      </a>
                    )}

                    {element.type === "divider" && <hr style={element.style} />}

                    {element.type === "spacer" && (
                      <div style={{ height: element.height }} />
                    )}

                    {element.type === "social" && (
                      <div
                        style={element.style}
                        className="flex justify-center space-x-4"
                      >
                        {element.socialLinks?.map(
                          (link: SocialLink, i: number) => (
                            <a
                              key={i}
                              href={link.url}
                              onClick={(e) => e.preventDefault()}
                              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                            >
                              <span className="uppercase font-bold text-xs">
                                {link.platform.charAt(0)}
                              </span>
                            </a>
                          )
                        )}
                      </div>
                    )}

                    {element.type === "code" && (
                      <div
                        className="border border-dashed p-2 bg-muted/20"
                        dangerouslySetInnerHTML={{
                          __html: element.content || "",
                        }}
                      />
                    )}

                    {element.type === "columns" && element.columns && (
                      <div
                        style={
                          element.style || { display: "flex", gap: "20px" }
                        }
                      >
                        {element.columns.map((column, index) => (
                          <div key={index} style={{ flex: 1 }}>
                            {column.map((columnElement) => (
                              <div
                                key={columnElement.id}
                                className={`my-2 ${
                                  selectedElement === columnElement.id
                                    ? "ring-2 ring-primary"
                                    : "hover:outline hover:outline-dashed hover:outline-muted"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedElement(columnElement.id);
                                  setActiveTab("properties");
                                }}
                              >
                                {columnElement.type === "heading" && (
                                  <h3 style={columnElement.style}>
                                    {columnElement.content}
                                  </h3>
                                )}

                                {columnElement.type === "text" && (
                                  <p style={columnElement.style}>
                                    {columnElement.content}
                                  </p>
                                )}

                                {columnElement.type === "image" && (
                                  <img
                                    src={columnElement.src}
                                    alt="Column image"
                                    style={columnElement.style}
                                  />
                                )}
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

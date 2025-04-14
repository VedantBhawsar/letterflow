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
  Table,
  Columns,
  Heading,
  Link as LinkIcon,
  AlignLeft,
  User as PersonalizationIcon,
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  newsletterTemplates,
  personalizationOptions,
} from "@/components/newsletters/newsletter-templates";
import { NewsletterElement } from "@/lib/types";

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

export default function NewsletterBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateType = searchParams.get("template") || "blank";

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

  // Initialize the newsletter with template data
  useEffect(() => {
    if (
      templateType &&
      newsletterTemplates[templateType as keyof typeof newsletterTemplates]
    ) {
      const template =
        newsletterTemplates[templateType as keyof typeof newsletterTemplates];
      setElements(template.elements);
    }

    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [templateType]);

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
    <div className="h-full w-full p-4">
      {/* Header toolbar */}
      <div className="flex items-center justify-between mb-4 border-b pb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/newsletters")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="border-l pl-2">
            <Input
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
              className="h-9 font-medium px-2 text-base"
            />
          </div>
        </div>

        <div className="flex space-x-2">
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

      {/* Builder interface */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-[calc(100vh-150px)]">
        {/* Left sidebar */}
        <div className="bg-muted/30 rounded-lg p-4 overflow-y-auto">
          <Tabs
            defaultValue="elements"
            value={activeTab}
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
                      </div>
                      {selectedElementData.type} Element
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleRemoveElement(selectedElement)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
        <div className="md:col-span-4 bg-white rounded-lg border p-6 overflow-y-auto">
          <div
            className="max-w-2xl mx-auto min-h-[500px] border"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            ref={builderRef}
          >
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
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`my-2 relative ${
                      selectedElement === element.id
                        ? "ring-2 ring-primary"
                        : "hover:outline hover:outline-muted"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element.id);
                      setActiveTab("properties");
                    }}
                  >
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
                        style={element.style}
                        onClick={(e) => e.preventDefault()}
                      >
                        {element.content}
                      </a>
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

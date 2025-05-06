"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react"; // Added useCallback, useMemo
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
  Mail, // Kept, but SendHorizonal might be better for "Send" button
  AlertCircle,
  X,
  SendHorizonal, // Consider using this for Send button
  FileText, // <-- FOR PASSAGE ELEMENT
  Pilcrow, // Alternative for Passage
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
  DialogClose, // Added DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  newsletterTemplates,
  personalizationOptions,
} from "@/components/newsletters/newsletter-templates";
import { NewsletterElement, SocialLink } from "@/lib/types"; // Ensure these types are well-defined
import { Label } from "@/components/ui/label";

// Tooltip fallback components (Keep as is)
const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;
const Tooltip = ({ children }: { children: React.ReactNode }) => children;
const TooltipTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) =>
  children;
const TooltipContent = ({ children }: { children: React.ReactNode }) => null;

// --- Constants ---
const ELEMENT_TYPES = [
  { type: "heading", icon: Heading, label: "Heading" },
  { type: "text", icon: Type, label: "Text" },
  { type: "passage", icon: FileText, label: "Passage" }, // <-- ADDED PASSAGE
  { type: "image", icon: ImageIcon, label: "Image" },
  { type: "button", icon: ButtonIcon, label: "Button" },
  { type: "columns", icon: Columns, label: "Columns" },
  { type: "divider", icon: Divider, label: "Divider" },
  { type: "spacer", icon: ArrowUpDown, label: "Spacer" },
  { type: "social", icon: Share2, label: "Social Icons" },
  { type: "code", icon: Braces, label: "HTML Code" },
];

type ViewModeOption = "desktop" | "tablet" | "mobile";

// --- Utility Functions for Element Manipulation ---
// (These should ideally be in a shared utils file if used elsewhere)
const findElementRecursive = (
  elementId: string,
  elementsArray: NewsletterElement[]
): { element: NewsletterElement; parentArray: NewsletterElement[]; index: number } | null => {
  for (let i = 0; i < elementsArray.length; i++) {
    const element = elementsArray[i];
    if (element.id === elementId) {
      return { element, parentArray: elementsArray, index: i };
    }
    if (element.type === "columns" && element.columns) {
      for (const column of element.columns) {
        const foundInColumn = findElementRecursive(elementId, column);
        if (foundInColumn) return foundInColumn;
      }
    }
  }
  return null;
};

const updateElementRecursive = (
  elementId: string,
  updater: (element: NewsletterElement) => NewsletterElement,
  elementsArray: NewsletterElement[]
): NewsletterElement[] => {
  return elementsArray.map((element) => {
    if (element.id === elementId) {
      return updater(element);
    }
    if (element.type === "columns" && element.columns) {
      return {
        ...element,
        columns: element.columns.map((column) =>
          updateElementRecursive(elementId, updater, column)
        ),
      };
    }
    return element;
  });
};

const removeElementRecursive = (
  elementId: string,
  elementsArray: NewsletterElement[]
): NewsletterElement[] => {
  const newArray = [];
  let changed = false;
  for (const element of elementsArray) {
    if (element.id === elementId) {
      changed = true;
      continue; // Skip this element
    }
    if (element.type === "columns" && element.columns) {
      const updatedColumns = element.columns.map((col) => removeElementRecursive(elementId, col));
      // Check if any column content actually changed
      if (JSON.stringify(updatedColumns) !== JSON.stringify(element.columns)) {
        changed = true;
      }
      newArray.push({ ...element, columns: updatedColumns });
    } else {
      newArray.push(element);
    }
  }
  // If nothing changed at this level or below, return original to preserve reference (optional optimization)
  // return changed ? newArray : elementsArray;
  return newArray; // Always return new array for simplicity with React state
};

export default function NewsletterEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // ID of the newsletter being edited
  const isNew = id === "new"; // Check if it's a new newsletter creation flow

  // Default template for new newsletters, or blank if loading existing
  const initialTemplateType = isNew ? "basic" : "blank"; // Example: "basic" template

  const [newsletterName, setNewsletterName] = useState("Loading newsletter...");
  const [elements, setElements] = useState<NewsletterElement[]>([]);
  const [pageLoading, setPageLoading] = useState(true); // Renamed for clarity
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"elements" | "properties" | "settings">("elements");

  const [viewMode, setViewMode] = useState<ViewModeOption>("desktop");
  const [history, setHistory] = useState<NewsletterElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 indicates no history yet or initial state

  const [emailSubject, setEmailSubject] = useState("");
  const [emailPreviewText, setEmailPreviewText] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("draft"); // Default to draft

  // Drag and Drop State
  const [draggedSidebarItemType, setDraggedSidebarItemType] = useState<string | null>(null); // For items from sidebar
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null); // For reordering existing elements
  const [dropTargetCanvasIndex, setDropTargetCanvasIndex] = useState<number | null>(null); // For inserting new elements
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null); // For reordering visual cue

  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // Renamed from error

  // Dialog states
  const [isSendTestDialogOpen, setIsSendTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<null | {
    sentCount: number;
    failedCount: number;
  }>(null);

  const builderRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const loadNewsletter = async () => {
      setPageLoading(true);
      setApiError(null);

      if (isNew) {
        const templateKey = initialTemplateType as keyof typeof newsletterTemplates;
        const template = newsletterTemplates[templateKey] || newsletterTemplates.blank;
        const initialElements = JSON.parse(JSON.stringify(template.elements)); // Deep copy

        setNewsletterName(`New ${template.name || "Newsletter"}`);
        setElements(initialElements);
        setHistory([initialElements]); // Initialize history
        setHistoryIndex(0);
        setEmailSubject("");
        setEmailPreviewText("");
        setNewsletterStatus("draft");
        setSelectedElementId(null);
        setActiveTab("elements");
        setTimeout(() => setPageLoading(false), 300); // Simulate load time
        return;
      }

      try {
        const response = await fetch(`/api/newsletters/${id}`);
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to load newsletter details." }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || typeof data !== "object") {
          throw new Error("Invalid data received for newsletter.");
        }

        setNewsletterName(data.name || "Untitled Newsletter");
        const loadedElements = Array.isArray(data.elements) ? data.elements : [];
        setElements(loadedElements);
        setEmailSubject(data.subject || "");
        setEmailPreviewText(data.previewText || "");
        setNewsletterStatus(data.status || "draft");
        setHistory([loadedElements]);
        setHistoryIndex(0);
        setSelectedElementId(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Error loading newsletter:", err);
        toast.error(`Load failed: ${errorMessage}`);
        setApiError(errorMessage); // Show error to user
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      // Ensure 'id' is available
      loadNewsletter();
    } else if (!isNew) {
      // This case should ideally not happen if routing is correct
      setApiError("Newsletter ID is missing.");
      setPageLoading(false);
      toast.error("Cannot load newsletter: ID is missing.");
      router.push("/dashboard/newsletters"); // Redirect if ID is invalid and not 'new'
    }
  }, [id, isNew, initialTemplateType, router]);

  // --- History Management ---
  useEffect(() => {
    if (!pageLoading && elements.length > 0 && historyIndex !== -1) {
      const currentHistoryElements = history[historyIndex];
      if (JSON.stringify(elements) !== JSON.stringify(currentHistoryElements)) {
        const newHistorySlice = history.slice(0, historyIndex + 1);
        setHistory([...newHistorySlice, elements]);
        setHistoryIndex(newHistorySlice.length);
      }
    }
  }, [elements, pageLoading, history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setElements(history[historyIndex - 1]);
      setSelectedElementId(null);
      toast.info("Undo successful");
    } else {
      toast.error("Nothing to undo");
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setElements(history[historyIndex + 1]);
      setSelectedElementId(null);
      toast.info("Redo successful");
    } else {
      toast.error("Nothing to redo");
    }
  }, [history, historyIndex]);

  // --- Element Data ---
  const selectedElementData = useMemo(() => {
    if (!selectedElementId) return null;
    return findElementRecursive(selectedElementId, elements)?.element ?? null;
  }, [selectedElementId, elements]);

  // --- Element Manipulation Callbacks ---
  const addElement = useCallback((type: string, targetIndex?: number) => {
    const newId = `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    let newElement: NewsletterElement = { id: newId, type, style: {} };

    // Default content and styles based on type (similar to NewsletterCreatePage)
    switch (type) {
      case "text":
        newElement.content = "Add your text here. Click to edit.";
        newElement.style = {
          fontSize: "16px",
          color: "#333333",
          textAlign: "left",
          padding: "5px",
        };
        break;
      case "passage":
        newElement.content =
          "This is a passage. You can write multiple paragraphs here.\n\nUse line breaks for new paragraphs.";
        newElement.style = {
          fontSize: "16px",
          color: "#333333",
          textAlign: "left",
          lineHeight: "1.6",
          margin: "10px 0",
          padding: "5px",
        };
        break;
      case "heading":
        newElement.content = "Main Heading";
        newElement.style = {
          fontSize: "28px",
          fontWeight: "bold",
          color: "#111111",
          textAlign: "left",
          padding: "5px 0",
        };
        break;
      case "image":
        newElement.src = "https://placehold.co/600x300/e2e8f0/a0aec0?text=Upload+Image";
        newElement.alt = "Placeholder image";
        newElement.style = { width: "100%", margin: "0 auto", display: "block" };
        break;
      case "button":
        newElement.content = "Click Here";
        newElement.url = "#";
        newElement.style = {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "4px",
          textAlign: "center",
          fontWeight: "normal",
          textDecoration: "none",
          display: "inline-block",
        };
        break;
      case "columns":
        newElement.columns = [
          [
            {
              id: `col-text-${Date.now()}-1`,
              type: "text",
              content: "Column 1",
              style: { padding: "10px" },
            },
          ],
          [
            {
              id: `col-text-${Date.now()}-2`,
              type: "text",
              content: "Column 2",
              style: { padding: "10px" },
            },
          ],
        ];
        newElement.style = { gap: "20px", padding: "10px 0" }; // Gap between columns
        break;
      case "divider":
        newElement.style = { borderTop: "1px solid #e5e7eb", margin: "20px 0", height: "0px" };
        break;
      case "spacer":
        newElement.height = "40px"; // This is a direct prop, style.height will also be set
        newElement.style = { height: "40px" };
        break;
      case "social":
        newElement.socialLinks = [
          { platform: "twitter", url: "#" },
          { platform: "facebook", url: "#" },
          { platform: "linkedin", url: "#" },
        ];
        newElement.style = { textAlign: "center", margin: "20px 0", gap: "10px" };
        break;
      case "code":
        newElement.content =
          "<p style='padding:15px; background:#f0f0f0; border:1px dashed #ccc;'>Your HTML code here</p>";
        newElement.style = { margin: "10px 0" };
        break;
      default:
        console.warn("Attempted to add unknown element type:", type);
        return;
    }

    setElements((prevElements) => {
      const newElementsList = [...prevElements];
      if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= newElementsList.length) {
        newElementsList.splice(targetIndex, 0, newElement);
      } else {
        newElementsList.push(newElement);
      }
      return newElementsList;
    });
    setSelectedElementId(newId);
    setActiveTab("properties");
    toast.success(`Added ${type} element`);
  }, []);

  const removeElement = useCallback(
    (elementId: string) => {
      setElements((prev) => removeElementRecursive(elementId, prev));
      if (selectedElementId === elementId) {
        setSelectedElementId(null);
        setActiveTab("elements");
      }
      toast.success("Element removed");
    },
    [selectedElementId]
  );

  const duplicateElement = useCallback(
    (elementId: string) => {
      const findResult = findElementRecursive(elementId, elements);
      if (!findResult) {
        toast.error("Could not find element to duplicate.");
        return;
      }

      const { element: elementToDuplicate, parentArray, index } = findResult;

      // Recursive function to duplicate an element and its children, assigning new IDs
      const deepDuplicate = (el: NewsletterElement): NewsletterElement => {
        const newId = `${el.type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
        const duplicatedEl = { ...JSON.parse(JSON.stringify(el)), id: newId }; // Deep copy, then set new ID

        if (duplicatedEl.type === "columns" && duplicatedEl.columns) {
          duplicatedEl.columns = duplicatedEl.columns.map((colArray: NewsletterElement[]) =>
            colArray.map(deepDuplicate)
          );
        }
        return duplicatedEl;
      };

      const duplicatedElement = deepDuplicate(elementToDuplicate);

      // Insert the duplicated element right after the original in its parent array
      const newParentArray = [...parentArray];
      newParentArray.splice(index + 1, 0, duplicatedElement);

      // If the parentArray is the main `elements` array
      if (parentArray === elements) {
        setElements(newParentArray);
      } else {
        // If it's a nested array (e.g., inside a column), we need to update the whole structure
        // This requires finding the path to the parentArray and updating it.
        // For simplicity, the current `updateElementRecursive` can be adapted or a new helper created.
        // For now, let's assume top-level duplication or handle nested duplication with a full state update.
        // A simpler approach is to rebuild the elements array if the change is nested.
        // For robustness, let's re-clone and modify if not top-level.
        setElements((prevElements) => {
          const clonedElements = JSON.parse(JSON.stringify(prevElements));
          const parentInfoInCloned = findElementRecursive(elementId, clonedElements);
          if (parentInfoInCloned) {
            parentInfoInCloned.parentArray.splice(
              parentInfoInCloned.index + 1,
              0,
              duplicatedElement
            );
            return clonedElements;
          }
          return prevElements; // Fallback
        });
      }

      setSelectedElementId(duplicatedElement.id);
      toast.success("Element duplicated");
    },
    [elements]
  );

  const updateElement = useCallback((elementId: string, updates: Partial<NewsletterElement>) => {
    setElements((prevElements) =>
      updateElementRecursive(
        elementId,
        (el) => ({
          ...el,
          ...updates,
          style: updates.style ? { ...el.style, ...updates.style } : el.style,
        }),
        prevElements
      )
    );
  }, []);

  const addPersonalizationToElement = useCallback((elementId: string, fieldId: string) => {
    const field = personalizationOptions.find((opt) => opt.id === fieldId);
    if (!field) return;

    setElements((prevElements) =>
      updateElementRecursive(
        elementId,
        (el) => {
          if (el.type === "text" || el.type === "heading" || el.type === "passage") {
            const currentContent = el.content || "";
            const space =
              currentContent && !currentContent.endsWith(" ") && !currentContent.endsWith("\n")
                ? " "
                : "";
            return {
              ...el,
              content: `${currentContent}${space}${field.defaultValue}`,
              personalizedFields: [
                ...(el.personalizedFields || []),
                { fieldName: field.id, defaultValue: field.defaultValue },
              ],
            };
          }
          return el;
        },
        prevElements
      )
    );
    toast.success(`Added ${field.label} personalization`);
  }, []);

  // --- Drag and Drop Handlers ---
  const handleSidebarDragStart = (e: React.DragEvent, type: string) => {
    setDraggedSidebarItemType(type);
    e.dataTransfer.setData("application/newsletter-element-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleSidebarDragEnd = () => setDraggedSidebarItemType(null);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedSidebarItemType) {
      e.dataTransfer.dropEffect = "copy";
      // Determine and show drop indicator for new element from sidebar
      // This logic can be complex, for now, let's assume it adds to end or a general area
    } else if (draggingElementId) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData("application/newsletter-element-type");
    if (type && draggedSidebarItemType === type) {
      // Simplified: add to end. Could calculate drop position relative to builderRef.
      addElement(type, elements.length);
      setDraggedSidebarItemType(null);
    }
    setDropIndicatorIndex(null); // Clear any reorder indicators
    // Clear CSS classes for drop indicators from all elements
    document
      .querySelectorAll(".drop-indicator-top, .drop-indicator-bottom")
      .forEach((el) => el.classList.remove("drop-indicator-top", "drop-indicator-bottom"));
  };

  const handleElementDragStart = (e: React.DragEvent, elementId: string) => {
    e.stopPropagation();
    setDraggingElementId(elementId);
    e.dataTransfer.setData("application/newsletter-element-id", elementId);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("opacity-50");
  };

  const handleElementDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("opacity-50");
    document
      .querySelectorAll(".drop-indicator-top, .drop-indicator-bottom")
      .forEach((el) => el.classList.remove("drop-indicator-top", "drop-indicator-bottom"));
    setDraggingElementId(null);
    setDropIndicatorIndex(null);
  };

  const handleElementDragOver = (e: React.DragEvent, targetElementIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingElementId) return;
    e.dataTransfer.dropEffect = "move";

    const sourceElementIndex = elements.findIndex((el) => el.id === draggingElementId);
    const targetHtmlElement = e.currentTarget as HTMLElement;

    document.querySelectorAll(".drop-indicator-top, .drop-indicator-bottom").forEach((el) => {
      if (el !== targetHtmlElement) {
        el.classList.remove("drop-indicator-top", "drop-indicator-bottom");
      }
    });

    const rect = targetHtmlElement.getBoundingClientRect();
    const verticalMidpoint = rect.top + rect.height / 2;
    const isOverTopHalf = e.clientY < verticalMidpoint;

    targetHtmlElement.classList.remove("drop-indicator-top", "drop-indicator-bottom");

    if (isOverTopHalf) {
      setDropIndicatorIndex(targetElementIndex);
      if (
        sourceElementIndex !== targetElementIndex &&
        sourceElementIndex !== targetElementIndex - 1
      ) {
        targetHtmlElement.classList.add("drop-indicator-top");
      }
    } else {
      setDropIndicatorIndex(targetElementIndex + 1);
      if (
        sourceElementIndex !== targetElementIndex &&
        sourceElementIndex !== targetElementIndex + 1
      ) {
        targetHtmlElement.classList.add("drop-indicator-bottom");
      }
    }
  };

  const handleElementDragLeave = (e: React.DragEvent) => {
    // (e.currentTarget as HTMLElement).classList.remove("drop-indicator-top", "drop-indicator-bottom");
    // More robust cleanup in DragEnd and DragOver of another element
  };

  const handleElementDrop = (e: React.DragEvent, _targetElementIndexUnderMouse: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData("application/newsletter-element-id");

    (e.currentTarget as HTMLElement).classList.remove(
      "drop-indicator-top",
      "drop-indicator-bottom"
    );
    document
      .querySelectorAll(".drop-indicator-top, .drop-indicator-bottom")
      .forEach((el) => el.classList.remove("drop-indicator-top", "drop-indicator-bottom"));

    if (
      !sourceId ||
      !draggingElementId ||
      sourceId !== draggingElementId ||
      dropIndicatorIndex === null
    ) {
      setDraggingElementId(null);
      setDropIndicatorIndex(null);
      return;
    }

    const sourceIndex = elements.findIndex((el) => el.id === sourceId);
    if (sourceIndex === -1) {
      setDraggingElementId(null);
      setDropIndicatorIndex(null);
      return;
    }

    const intendedInsertionPoint = dropIndicatorIndex;
    let actualFinalIndex = intendedInsertionPoint;
    if (sourceIndex < intendedInsertionPoint) {
      actualFinalIndex = intendedInsertionPoint - 1;
    }

    if (sourceIndex === actualFinalIndex) {
      setDraggingElementId(null);
      setDropIndicatorIndex(null);
      return;
    }

    setElements((prevElements) => {
      const newElementsArray = [...prevElements];
      const currentSourceIdx = newElementsArray.findIndex((el) => el.id === sourceId);
      if (currentSourceIdx === -1) return prevElements;

      const [movedElement] = newElementsArray.splice(currentSourceIdx, 1);

      let insertionIdx = intendedInsertionPoint;
      if (currentSourceIdx < intendedInsertionPoint) {
        insertionIdx = intendedInsertionPoint - 1;
      }
      insertionIdx = Math.max(0, Math.min(insertionIdx, newElementsArray.length));

      newElementsArray.splice(insertionIdx, 0, movedElement);
      return newElementsArray;
    });

    toast.success("Element reordered");
    setSelectedElementId(sourceId);
    setDraggingElementId(null);
    setDropIndicatorIndex(null);
  };

  // --- API Handlers ---
  const handleSave = async () => {
    if (!newsletterName.trim()) {
      toast.error("Newsletter name cannot be empty.");
      setApiError("Newsletter name is required.");
      return;
    }
    if (!emailSubject.trim() && newsletterStatus === "published") {
      // Subject important for published
      toast.error("Email subject is required for published newsletters.");
      setApiError("Email subject is required.");
      setActiveTab("settings");
      return;
    }

    setIsSaving(true);
    setApiError(null);

    const newsletterData = {
      name: newsletterName,
      elements,
      subject: emailSubject,
      previewText: emailPreviewText,
      status: newsletterStatus,
    };

    try {
      const response = await fetch(`/api/newsletters${isNew ? "" : `/${id}`}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsletterData),
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      toast.success(`Newsletter ${isNew ? "created" : "updated"} successfully!`);
      if (isNew && responseData.id) {
        router.replace(`/newsletter/${responseData.id}`); // Use replace to avoid back button issues
      }
      // Optionally re-fetch or update local state if PUT returns the full updated object
      // For now, we assume the local state is the source of truth until a full reload.
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setApiError(errorMessage);
      toast.error(`Save failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim() || !testEmail.includes("@") || !testEmail.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSendingTest(true);
    try {
      const response = await fetch(`/api/newsletters/${id}/send-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          subject: emailSubject,
          previewText: emailPreviewText,
          elements: elements, // Send the current elements array
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send test email");
      }

      const data = await response.json();
      toast.success(data.message || `Test email sent to ${testEmail}`);
      setIsSendTestDialogOpen(false);
    } catch (err) {
      console.error("Error sending test email:", err);
      let errorMessage = "Failed to send test email";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleDeleteNewsletter = async () => {
    if (isNew) {
      toast.info("This newsletter has not been saved yet.");
      setIsDeleteDialogOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/newsletters/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete newsletter.");
      }
      toast.success("Newsletter deleted successfully.");
      router.push("/dashboard/newsletters");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error.";
      toast.error(`Deletion failed: ${msg}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePublishNewsletter = async () => {
    if (isNew) {
      toast.warning("Please save the newsletter first.");
      return;
    }
    setIsPublishing(true);
    setPublishResult(null);
    try {
      // Ensure status is 'published' and saved
      if (newsletterStatus !== "published") {
        setNewsletterStatus("published"); // Update local state first
        // Call handleSave, but ensure it completes before proceeding
        // This might require handleSave to return its promise for chaining
        await handleSave(); // Assuming handleSave is patched to work with the status change
      }

      const response = await fetch(`/api/newsletters/${id}/publish`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Publishing failed.");

      setPublishResult({ sentCount: data.sentCount || 0, failedCount: data.failedCount || 0 });
      toast.success(`Newsletter published to ${data.sentCount || 0} subscribers.`);
      // Dialog will show results, no need to close it here immediately
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error.";
      toast.error(`Publish failed: ${msg}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExit = () => router.push("/dashboard/newsletters");

  // --- Render ---
  if (pageLoading) {
    return (
      // Consistent Page Loading Skeleton
      <div className="h-screen w-full p-6 space-y-6 flex flex-col">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-9 rounded-md" /> {/* Back button */}
            <Skeleton className="h-9 w-60 rounded-md" /> {/* Name Input */}
            <div className="flex space-x-1">
              {" "}
              {/* Undo/Redo */}
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="flex space-x-1">
              {" "}
              {/* View Modes */}
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
          <div className="flex space-x-2">
            {" "}
            {/* Action Buttons */}
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 h-[calc(100vh-150px)]">
          <Skeleton className="h-full rounded-md bg-muted/30" /> {/* Sidebar */}
          <div className="md:col-span-4 bg-white flex items-center justify-center p-6">
            {" "}
            {/* Canvas Area */}
            <Skeleton className="h-full w-full max-w-2xl rounded-lg bg-gray-50" />
          </div>
        </div>
      </div>
    );
  }

  if (apiError && elements.length === 0 && !isNew) {
    // Show critical error if loading failed and not creating new
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Newsletter</h2>
        <p className="text-muted-foreground mb-4 max-w-md">{apiError}</p>
        <Button onClick={handleExit} variant="outline">
          <ChevronLeft className="h-4 w-4 mr-2" /> Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Toolbar */}
      <header className="flex items-center justify-between p-3 border-b bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Exit
          </Button>
          <Input
            value={newsletterName}
            onChange={(e) => setNewsletterName(e.target.value)}
            className="h-9 font-medium px-2 text-base w-[250px] border-transparent focus:border-input hover:border-gray-300"
            placeholder="Newsletter Name..."
          />
          <div className="flex space-x-1 border-l pl-3 ml-1">
            {" "}
            {/* Undo/Redo */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex border rounded-md p-[2px] bg-muted/60">
            {(["mobile", "tablet", "desktop"] as ViewModeOption[]).map((mode) => (
              <TooltipProvider key={mode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === mode ? "secondary" : "ghost"}
                      size="sm"
                      className={`h-7 px-2 ${viewMode === mode ? "shadow-sm" : ""}`}
                      onClick={() => setViewMode(mode)}
                    >
                      {mode === "mobile" && <Smartphone className="h-4 w-4" />}
                      {mode === "tablet" && <Tablet className="h-4 w-4" />}
                      {mode === "desktop" && <Monitor className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} view
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isNew && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete this newsletter</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab(activeTab === "settings" ? "elements" : "settings")}
                  className={activeTab === "settings" ? "bg-secondary" : ""}
                >
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>Email Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/newsletter/preview/${id}`, "_blank")}
                  disabled={isNew}
                >
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Live Preview (opens new tab)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="min-w-[100px]">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    if (isNew) {
                      toast.warning("Save the newsletter first to send or publish.");
                      return;
                    }
                    setIsSendTestDialogOpen(true); // For test send
                  }}
                  disabled={isNew || isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-1" /> Send Test
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send a test email</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    if (isNew) {
                      toast.warning("Save the newsletter first to send or publish.");
                      return;
                    }
                    setIsPublishDialogOpen(true);
                  }}
                  disabled={isNew || isSaving || newsletterStatus !== "published"} // Can only publish if status is 'published'
                  className="bg-green-600 hover:bg-green-700 text-white"
                  title={
                    newsletterStatus !== "published"
                      ? "Set status to 'Published' in settings first"
                      : "Publish to subscribers"
                  }
                >
                  <SendHorizonal className="h-4 w-4 mr-1" /> Publish
                </Button>
              </TooltipTrigger>
              <TooltipContent>Publish to all subscribers</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {apiError &&
        !pageLoading && ( // Show non-critical API errors here
          <div className="bg-destructive/15 text-destructive text-sm p-3 px-4 border-b border-destructive/30 flex justify-between items-center">
            <span>Error: {apiError}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive"
              onClick={() => setApiError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

      {/* Settings Panel (Modal-like overlay) */}
      {activeTab === "settings" && (
        <div className="bg-white p-4 border-b shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Email Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab("elements")}
              className="h-8 w-8"
            >
              <X className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="emailSubject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Your catchy email subject"
                required
              />
            </div>
            <div>
              <Label htmlFor="emailPreviewText">Preview Text</Label>
              <Input
                id="emailPreviewText"
                value={emailPreviewText}
                onChange={(e) => setEmailPreviewText(e.target.value)}
                placeholder="Brief preview shown after subject"
              />
            </div>
            <div>
              <Label htmlFor="newsletterStatus">Status</Label>
              <Select
                value={newsletterStatus}
                onValueChange={(val) => setNewsletterStatus(val as typeof newsletterStatus)}
              >
                <SelectTrigger id="newsletterStatus" className="h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  {/* Add other statuses like 'archived' if needed */}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Set to 'Published' to enable the Publish button.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-muted/30 p-4 overflow-y-auto border-r flex flex-col">
          <Tabs
            value={activeTab === "settings" ? "elements" : activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid grid-cols-2 mb-4 sticky top-0 bg-muted/30 z-10 pt-1">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="properties" disabled={!selectedElementId}>
                Properties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="space-y-4 flex-1 overflow-y-auto">
              <div className="text-sm font-medium text-gray-600">Content Blocks</div>
              <div className="grid grid-cols-2 gap-2">
                {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
                  <div
                    key={type}
                    className="flex flex-col items-center justify-center p-3 border rounded-md cursor-grab bg-white hover:bg-muted/80 active:cursor-grabbing active:opacity-70"
                    draggable
                    onDragStart={(e) => handleSidebarDragStart(e, type)}
                    onDragEnd={handleSidebarDragEnd}
                    onClick={() => addElement(type)}
                    title={`Add ${label}`}
                  >
                    <Icon className="h-5 w-5 mb-1 text-gray-700" />
                    <span className="text-xs text-center text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="text-sm font-medium text-gray-600 mb-2">Personalization</div>
                <div className="space-y-2">
                  {personalizationOptions.map((field) => (
                    <Button
                      key={field.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs bg-white"
                      onClick={() => {
                        if (
                          selectedElementId &&
                          (selectedElementData?.type === "text" ||
                            selectedElementData?.type === "heading" ||
                            selectedElementData?.type === "passage")
                        ) {
                          addPersonalizationToElement(selectedElementId, field.id);
                        } else {
                          toast.error("Select a Text, Heading, or Passage element first.");
                        }
                      }}
                      disabled={
                        !selectedElementId ||
                        !["text", "heading", "passage"].includes(selectedElementData?.type || "")
                      }
                    >
                      <PersonalizationIcon className="h-3 w-3 mr-2" /> Insert {field.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-5 flex-1 overflow-y-auto pb-10">
              {selectedElementId && selectedElementData ? (
                <PropertiesPanel
                  key={selectedElementId}
                  element={selectedElementData}
                  onUpdate={(updates) => updateElement(selectedElementId, updates)}
                  onRemove={() => removeElement(selectedElementId)}
                  onDuplicate={() => duplicateElement(selectedElementId)}
                />
              ) : (
                <div className="text-center p-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                  <Menu className="h-12 w-12 mb-4 text-gray-400" />
                  <p className="font-medium">Select an element</p>
                  <p className="text-sm">
                    Click on an element in the canvas to edit its properties.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </aside>

        {/* Canvas */}
        <main
          className="bg-white p-6 overflow-y-auto flex justify-center items-start"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          <div
            ref={builderRef}
            className={`newsletter-canvas transition-all duration-300 bg-gray-50 shadow-inner border border-dashed border-gray-300 rounded-lg w-full min-h-[600px] relative ${
              viewMode === "desktop" ? "max-w-3xl" : viewMode === "tablet" ? "max-w-xl" : "max-w-sm"
            }`}
            style={{ padding: "20px" }} // Consistent padding for content
            onDragOver={handleCanvasDragOver} // For sidebar items to canvas general area
            onDrop={handleCanvasDrop} // For sidebar items to canvas general area
          >
            {viewMode !== "desktop" && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-700 text-white text-xs py-1 px-3 rounded-t-md shadow">
                {viewMode === "tablet" ? (
                  <Tablet className="h-3 w-3 mr-1.5" />
                ) : (
                  <Smartphone className="h-3 w-3 mr-1.5" />
                )}
                {viewMode === "tablet" ? "Tablet Preview" : "Mobile Preview"}
              </div>
            )}
            {elements.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-500 p-10">
                <Layout className="h-16 w-16 mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-1">Build Your Newsletter</h3>
                <p className="text-sm">Drag elements from the left panel or click to add.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    id={`element-${element.id}`}
                    className={`element-wrapper relative group transition-all duration-150 ${
                      selectedElementId === element.id
                        ? "outline-none ring-2 ring-primary ring-offset-2 rounded-sm"
                        : "hover:bg-primary/5"
                    } ${draggingElementId === element.id ? "opacity-30 dragging-active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(element.id);
                      setActiveTab("properties");
                    }}
                    draggable
                    onDragStart={(e) => handleElementDragStart(e, element.id)}
                    onDragEnd={handleElementDragEnd}
                    onDragOver={(e) => handleElementDragOver(e, index)}
                    onDragLeave={handleElementDragLeave}
                    onDrop={(e) => handleElementDrop(e, index)}
                    style={{ padding: "4px", minHeight: "30px", position: "relative" }}
                  >
                    <div
                      className={`absolute top-1 right-1 hidden group-hover:flex group-focus-within:flex ${selectedElementId === element.id ? "!flex" : ""} items-center bg-white shadow-md border rounded p-0.5 z-10 space-x-0.5`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-primary"
                              onClick={() => duplicateElement(element.id)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeElement(element.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div
                      className={`absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full hidden group-hover:flex group-focus-within:flex ${selectedElementId === element.id ? "!flex" : ""} items-center bg-white shadow-md border rounded-full p-0.5 z-10 cursor-move`}
                      title="Drag to reorder"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Menu className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <RenderNewsletterElement
                      element={element}
                      viewMode={viewMode}
                      isSelected={selectedElementId === element.id}
                      onSelect={setSelectedElementId}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dialogs: Send Test, Publish, Delete (Mostly unchanged, added DialogClose where appropriate) */}
      <Dialog open={isSendTestDialogOpen} onOpenChange={setIsSendTestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test to verify how your newsletter will look.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                type="email"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Subject: <span className="font-medium">{emailSubject || "(No subject set)"}</span>
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSendTest} disabled={isSendingTest || !testEmail.trim() || isNew}>
              {isSendingTest && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPublishDialogOpen}
        onOpenChange={(open) => {
          setIsPublishDialogOpen(open);
          if (!open) setPublishResult(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Newsletter</DialogTitle>
            <DialogDescription>
              This will send your newsletter to all active subscribers.
            </DialogDescription>
          </DialogHeader>
          {publishResult ? (
            <div className="space-y-4 py-4 text-center">
              <h3 className="font-medium text-lg">Newsletter Published!</h3>
              <div className="flex justify-center space-x-8">
                <div>
                  <p className="text-3xl font-bold text-green-600">{publishResult.sentCount}</p>
                  <p className="text-sm text-muted-foreground">Sent Successfully</p>
                </div>
                {publishResult.failedCount > 0 && (
                  <div>
                    <p className="text-3xl font-bold text-destructive">
                      {publishResult.failedCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed to Send</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm">
                Publish <span className="font-medium">{newsletterName}</span> with subject:{" "}
                <span className="font-medium">{emailSubject || "(No subject)"}</span>?
              </p>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Action</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. Ensure your newsletter is finalized and tested.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{publishResult ? "Close" : "Cancel"}</Button>
            </DialogClose>
            {!publishResult && (
              <Button
                variant="default"
                onClick={handlePublishNewsletter}
                disabled={isPublishing || isNew || newsletterStatus !== "published"}
              >
                {isPublishing && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Publish Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Newsletter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{newsletterName}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteNewsletter}
              disabled={isDeleting || isNew}
            >
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

      {/* Global Styles for Drag Indicators */}
      <style jsx global>{`
        .element-wrapper.drop-indicator-top::before {
          content: "";
          display: block;
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #3b82f6;
          border-radius: 2px;
          z-index: 20;
          animation: pulse-indicator 1.2s infinite ease-in-out;
        }
        .element-wrapper.drop-indicator-bottom::after {
          content: "";
          display: block;
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #3b82f6;
          border-radius: 2px;
          z-index: 20;
          animation: pulse-indicator 1.2s infinite ease-in-out;
        }
        @keyframes pulse-indicator {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .dragging-active {
          /* opacity is handled by inline style now */
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .custom-html-preview > * {
          margin: 0 !important;
        } /* For HTML element */
      `}</style>
    </div>
  );
}

// --- Sub-Components (PropertiesPanel, RenderNewsletterElement, Property Inputs) ---
// These should be very similar to the ones from NewsletterCreatePage,
// ensure they are consistent or refactor into shared components.

// --- PropertiesPanel Component (Passage type added, general structure) ---
interface PropertiesPanelProps {
  element: NewsletterElement;
  onUpdate: (updates: Partial<NewsletterElement>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

function PropertiesPanel({ element, onUpdate, onRemove, onDuplicate }: PropertiesPanelProps) {
  const ElementIcon = ELEMENT_TYPES.find((et) => et.type === element.type)?.icon || Layout;

  const handleStyleChange = (property: string, value: string | number) => {
    // Allow number for some CSS props
    onUpdate({ style: { ...element.style, [property]: value } });
  };
  const handlePropChange = (prop: keyof NewsletterElement, value: any) => {
    onUpdate({ [prop]: value });
  };

  // Helper to create a unique ID for inputs to link with labels
  const inputId = (propName: string) => `prop-${element.id}-${propName}`;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary">
            <ElementIcon className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold capitalize">{element.type} Properties</span>
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={onDuplicate}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={onRemove}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content Properties */}
      {(element.type === "text" || element.type === "heading" || element.type === "passage") && (
        <div className="space-y-1">
          <Label htmlFor={inputId("content")} className="text-xs font-medium">
            Text Content
          </Label>
          <Textarea
            id={inputId("content")}
            value={element.content || ""}
            onChange={(e) => handlePropChange("content", e.target.value)}
            rows={element.type === "heading" ? 2 : element.type === "passage" ? 8 : 5}
          />
        </div>
      )}
      {element.type === "button" && (
        <>
          <div className="space-y-1">
            <Label htmlFor={inputId("btn-text")} className="text-xs font-medium">
              Button Text
            </Label>
            <Input
              id={inputId("btn-text")}
              value={element.content || ""}
              onChange={(e) => handlePropChange("content", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={inputId("btn-url")} className="text-xs font-medium">
              Link URL
            </Label>
            <Input
              id={inputId("btn-url")}
              type="url"
              value={element.url || ""}
              placeholder="https://example.com"
              onChange={(e) => handlePropChange("url", e.target.value)}
            />
          </div>
        </>
      )}
      {element.type === "image" && (
        <>
          <div className="space-y-1">
            <Label htmlFor={inputId("img-src")} className="text-xs font-medium">
              Image URL
            </Label>
            <Input
              id={inputId("img-src")}
              type="url"
              value={element.src || ""}
              placeholder="https://..."
              onChange={(e) => handlePropChange("src", e.target.value)}
            />
            {element.src && (
              <img
                src={element.src}
                alt="Preview"
                className="mt-2 rounded border p-1 max-w-[150px] max-h-[100px] object-contain"
              />
            )}
          </div>
          <div className="space-y-1 mt-2">
            <Label htmlFor={inputId("img-alt")} className="text-xs font-medium">
              Alt Text (Accessibility)
            </Label>
            <Input
              id={inputId("img-alt")}
              value={element.alt || ""}
              placeholder="Describe the image"
              onChange={(e) => handlePropChange("alt", e.target.value)}
            />
          </div>
        </>
      )}
      {element.type === "social" && (
        <div className="space-y-3">
          <Label className="text-xs font-medium block">Social Links</Label>
          {(element.socialLinks || []).map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Label
                htmlFor={inputId(`social-${link.platform}`)}
                className="text-sm capitalize w-20 shrink-0"
              >
                {link.platform}:
              </Label>
              <Input
                id={inputId(`social-${link.platform}`)}
                type="url"
                value={link.url || ""}
                placeholder={`https://...`}
                onChange={(e) => {
                  const newLinks = [...(element.socialLinks || [])];
                  newLinks[index] = { ...newLinks[index], url: e.target.value };
                  handlePropChange("socialLinks", newLinks);
                }}
              />
            </div>
          ))}
          {/* TODO: Add/Remove social link buttons */}
        </div>
      )}
      {element.type === "code" && (
        <div className="space-y-1">
          <Label htmlFor={inputId("code-content")} className="text-xs font-medium">
            Custom HTML
          </Label>
          <Textarea
            id={inputId("code-content")}
            value={element.content || ""}
            onChange={(e) => handlePropChange("content", e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs">Use with Caution!</AlertTitle>
            <AlertDescription className="text-xs">
              Invalid HTML can break your newsletter. Test thoroughly.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Styling Properties */}
      <div className="space-y-3 border-t pt-4 mt-4">
        <Label className="text-xs font-semibold block mb-1">Styling</Label>
        {(element.type === "text" || element.type === "heading" || element.type === "passage") && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PropertyInput
              label="Font Size"
              value={(element.style?.fontSize as string) || ""}
              onChange={(v) => handleStyleChange("fontSize", v)}
              placeholder="e.g., 16px or 1.2em"
              elementId={element.id}
              propName="fontSize"
            />
            <PropertySelect
              label="Alignment"
              value={element.style?.textAlign || "left"}
              onChange={(v) => handleStyleChange("textAlign", v)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              elementId={element.id}
              propName="textAlign"
            />
            <PropertySelect
              label="Font Weight"
              value={(element.style?.fontWeight as string) || "normal"}
              onChange={(v) => handleStyleChange("fontWeight", v)}
              options={[
                { value: "normal", label: "Normal" },
                { value: "bold", label: "Bold" },
                { value: "300", label: "Light" },
                { value: "600", label: "Semi-Bold" },
              ]}
              elementId={element.id}
              propName="fontWeight"
            />
            <PropertyColorInput
              label="Text Color"
              value={element.style?.color || "#333333"}
              onChange={(v) => handleStyleChange("color", v)}
              elementId={element.id}
              propName="color"
            />
            <PropertyInput
              label="Line Height"
              value={
                (element.style?.lineHeight as string) ||
                (element.type === "passage" ? "1.6" : "normal")
              }
              onChange={(v) => handleStyleChange("lineHeight", v)}
              placeholder="e.g., 1.5 or 24px"
              elementId={element.id}
              propName="lineHeight"
            />
            <PropertyInput
              label="Padding (TRBL)"
              value={(element.style?.padding as string) || "0"}
              onChange={(v) => handleStyleChange("padding", v)}
              placeholder="e.g., 10px or 5px 10px"
              elementId={element.id}
              propName="padding"
            />
          </div>
        )}
        {element.type === "button" && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PropertyColorInput
              label="Background"
              value={element.style?.backgroundColor || "#3b82f6"}
              onChange={(v) => handleStyleChange("backgroundColor", v)}
              elementId={element.id}
              propName="bgColor"
            />
            <PropertyColorInput
              label="Text Color"
              value={element.style?.color || "#ffffff"}
              onChange={(v) => handleStyleChange("color", v)}
              elementId={element.id}
              propName="textColor"
            />
            <PropertySelect
              label="Font Weight"
              value={(element.style?.fontWeight as string) || "normal"}
              onChange={(v) => handleStyleChange("fontWeight", v)}
              options={[
                { value: "normal", label: "Normal" },
                { value: "bold", label: "Bold" },
              ]}
              elementId={element.id}
              propName="fontWeight"
            />
            <PropertyInput
              label="Padding (Y X)"
              value={(element.style?.padding as string) || "10px 20px"}
              onChange={(v) => handleStyleChange("padding", v)}
              placeholder="e.g., 10px 20px"
              elementId={element.id}
              propName="padding"
            />
            <PropertyInput
              label="Border Radius"
              value={(element.style?.borderRadius as string) || "4px"}
              onChange={(v) => handleStyleChange("borderRadius", v)}
              placeholder="e.g., 4px or 0.5rem"
              elementId={element.id}
              propName="borderRadius"
            />
            <PropertySelect
              label="Alignment (Button Block)"
              value={(element.style?.alignContent as string) || "center"}
              onChange={(v) => handleStyleChange("textAlignContainer", v)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              elementId={element.id}
              propName="textAlignContainer"
              helpText="Aligns the button within its block."
            />
          </div>
        )}
        {element.type === "image" && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PropertyInput
              label="Width"
              value={(element.style?.width as string) || "100%"}
              onChange={(v) => handleStyleChange("width", v)}
              placeholder="e.g., 100% or 300px"
              elementId={element.id}
              propName="width"
            />
            <PropertySelect
              label="Alignment"
              value={
                element.style?.display === "block" &&
                (element.style?.margin as string)?.includes("auto")
                  ? "center"
                  : element.style?.display === "block" &&
                      (element.style?.margin as string)?.endsWith(" auto")
                    ? "right"
                    : "left"
              }
              onChange={(v) => {
                if (v === "center")
                  onUpdate({ style: { ...element.style, display: "block", margin: "0 auto" } });
                else if (v === "right")
                  onUpdate({ style: { ...element.style, display: "block", margin: "0 0 0 auto" } });
                else onUpdate({ style: { ...element.style, display: "block", margin: "0" } }); // Left
              }}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              elementId={element.id}
              propName="imgAlign"
            />
            <PropertyInput
              label="Padding (TRBL)"
              value={(element.style?.padding as string) || "0"}
              onChange={(v) => handleStyleChange("padding", v)}
              placeholder="e.g., 10px"
              elementId={element.id}
              propName="imgPadding"
            />
          </div>
        )}
        {element.type === "divider" && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PropertySelect
              label="Style"
              value={(element.style?.borderTopStyle as string) || "solid"}
              onChange={(v) => handleStyleChange("borderTopStyle", v)}
              options={[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
              ]}
              elementId={element.id}
              propName="divStyle"
            />
            <PropertyInput
              label="Thickness"
              value={(element.style?.borderTopWidth as string) || "1px"}
              onChange={(v) => handleStyleChange("borderTopWidth", v)}
              placeholder="e.g., 1px"
              elementId={element.id}
              propName="divThick"
            />
            <PropertyColorInput
              label="Color"
              value={(element.style?.borderTopColor as string) || "#e5e7eb"}
              onChange={(v) => handleStyleChange("borderTopColor", v)}
              elementId={element.id}
              propName="divColor"
            />
            <PropertyInput
              label="Spacing (Y X)"
              value={(element.style?.margin as string) || "20px 0"}
              onChange={(v) => handleStyleChange("margin", v)}
              placeholder="e.g., 20px 0"
              elementId={element.id}
              propName="divMargin"
            />
          </div>
        )}
        {element.type === "spacer" && (
          <PropertyInput
            label="Height"
            value={(element.style?.height as string) || element.height || "40px"}
            onChange={(v) => {
              handleStyleChange("height", v);
              handlePropChange("height", v);
            }}
            placeholder="e.g., 40px"
            elementId={element.id}
            propName="spacerHeight"
          />
        )}
        {element.type === "columns" && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <PropertyInput
              label="Gap between columns"
              value={(element.style?.gap as string) || "20px"}
              onChange={(v) => handleStyleChange("gap", v)}
              placeholder="e.g., 20px"
              elementId={element.id}
              propName="colGap"
            />
            <PropertyInput
              label="Padding (Outer)"
              value={(element.style?.padding as string) || "10px 0"}
              onChange={(v) => handleStyleChange("padding", v)}
              placeholder="e.g., 10px 0"
              elementId={element.id}
              propName="colPadding"
            />
            {/* Add option for number of columns? (more complex) */}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components for PropertiesPanel (PropertySelect updated for immersiveness)
const PropertyInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  elementId,
  propName,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  elementId: string;
  propName: string;
  helpText?: string;
}) => (
  <div className="space-y-1">
    <Label htmlFor={`${elementId}-${propName}`} className="text-xs font-medium">
      {label}
    </Label>
    <Input
      id={`${elementId}-${propName}`}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="text-sm h-9"
    />
    {helpText && <p className="text-xs text-muted-foreground mt-0.5">{helpText}</p>}
  </div>
);
const PropertyColorInput = ({
  label,
  value,
  onChange,
  elementId,
  propName,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  elementId: string;
  propName: string;
}) => (
  <div className="space-y-1">
    <Label htmlFor={`${elementId}-${propName}`} className="text-xs font-medium">
      {label}
    </Label>
    <Input
      id={`${elementId}-${propName}`}
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full p-1"
    />
  </div>
);
const PropertySelect = ({
  label,
  value,
  onChange,
  options,
  elementId,
  propName,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  elementId: string;
  propName: string;
  helpText?: string;
}) => (
  <div className="space-y-1">
    <Label htmlFor={`${elementId}-${propName}`} className="text-xs font-medium">
      {label}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={`${elementId}-${propName}`} className="text-sm w-full h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {helpText && <p className="text-xs text-muted-foreground mt-0.5">{helpText}</p>}
  </div>
);

// --- RenderNewsletterElement Component (Passage type added, improved rendering) ---
interface RenderNewsletterElementProps {
  element: NewsletterElement;
  viewMode: ViewModeOption;
  isSelected?: boolean; // Optional: if you want to pass selection state for styling
  onSelect?: (elementId: string) => void; // Optional: if elements themselves handle click
  // Add other props if elements need to interact, e.g., for nested DnD
}

function RenderNewsletterElement({
  element,
  viewMode,
  isSelected,
  onSelect,
}: RenderNewsletterElementProps) {
  const commonStyles: React.CSSProperties = {
    margin: element.style?.margin ?? undefined, // Use undefined to let browser/email client defaults apply if not set
    padding: element.style?.padding ?? undefined,
    wordBreak: "break-word",
    ...element.style,
  };

  // Specific style adjustments for email client compatibility
  const emailSafeStyles = { ...commonStyles };
  if (element.type === "button" && emailSafeStyles.display === "inline-block") {
    // Ensure button specific styles are applied if not overridden
    emailSafeStyles.backgroundColor = emailSafeStyles.backgroundColor || "#3b82f6";
    emailSafeStyles.color = emailSafeStyles.color || "#ffffff";
    emailSafeStyles.padding = emailSafeStyles.padding || "10px 20px";
    emailSafeStyles.borderRadius = emailSafeStyles.borderRadius || "4px";
    emailSafeStyles.textDecoration = emailSafeStyles.textDecoration || "none";
  }
  if (element.type === "image") {
    emailSafeStyles.display = "block"; // Important for images in email
    emailSafeStyles.maxWidth = "100%";
    emailSafeStyles.height = "auto";
    emailSafeStyles.width = emailSafeStyles.width || "100%"; // Default to full width if not specified
  }
  if (element.type === "divider") {
    emailSafeStyles.borderTopStyle = element.style?.borderTopStyle || "solid";
    emailSafeStyles.borderTopWidth = (element.style?.borderTopWidth as string) || "1px";
    emailSafeStyles.borderTopColor = (element.style?.borderTopColor as string) || "#e5e7eb";
    emailSafeStyles.height = "0px";
    emailSafeStyles.margin = emailSafeStyles.margin || "20px 0";
    // Remove conflicting properties that might be in element.style
    delete emailSafeStyles.borderTop;
  }
  if (element.type === "spacer") {
    emailSafeStyles.height = element.style?.height || element.height || "20px";
    emailSafeStyles.fontSize = "1px"; // Outlook hack
    emailSafeStyles.lineHeight = "1px"; // Outlook hack
  }

  const handleClick = onSelect
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(element.id);
      }
    : undefined;

  switch (element.type) {
    case "heading":
      return (
        <h2 style={emailSafeStyles} onClick={handleClick}>
          {element.content || "Empty Heading"}
        </h2>
      );
    case "text":
      return (
        <p style={emailSafeStyles} onClick={handleClick}>
          {element.content || "Empty Text Block"}
        </p>
      );
    case "passage":
      return (
        <div
          style={{ whiteSpace: "pre-wrap", ...emailSafeStyles }}
          dangerouslySetInnerHTML={{
            __html: (element.content || "Empty Passage").replace(/\n/g, "<br />"),
          }}
          onClick={handleClick}
        />
      );
    case "image":
      return (
        <img
          src={element.src || "https://placehold.co/600x300/e9ecef/adb5bd?text=No+Image"}
          alt={element.alt || "Newsletter image"}
          style={emailSafeStyles}
          onClick={handleClick}
        />
      );
    case "button":
      // Email buttons are best rendered with tables for compatibility
      return (
        <table
          role="presentation"
          border={0}
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{
            borderCollapse: "collapse",
            textAlign: element.style?.textAlign || "center",
          }}
        >
          <tbody>
            <tr>
              <td align={"center"} style={{ padding: "5px 0" }}>
                <a
                  href={element.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={emailSafeStyles}
                  onClick={(e) => {
                    handleClick?.(e);
                    e.preventDefault(); /* prevent nav in editor */
                  }}
                >
                  {element.content || "Button Text"}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      );
    case "divider":
      return <div style={emailSafeStyles} onClick={handleClick}></div>;
    case "spacer":
      return <div style={emailSafeStyles} onClick={handleClick}></div>;
    case "social":
      if (!element.socialLinks || element.socialLinks.length === 0) {
        return (
          <p
            style={{
              ...emailSafeStyles,
              textAlign: (emailSafeStyles.textAlign as any) || "center",
              fontStyle: "italic",
              color: "#999",
            }}
            onClick={handleClick}
          >
            No social links configured.
          </p>
        );
      }
      return (
        <table
          role="presentation"
          border={0}
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ ...emailSafeStyles, margin: emailSafeStyles.margin || "20px 0" }}
        >
          <tbody>
            <tr>
              <td
                align={(emailSafeStyles.textAlign as any) || "center"}
                style={{
                  textAlign: (emailSafeStyles.textAlign as any) || "center",
                  padding: "5px 0",
                }}
              >
                <div style={{ display: "inline-block" }} onClick={handleClick}>
                  <table
                    role="presentation"
                    border={0}
                    cellPadding="0"
                    cellSpacing={element.style?.gap ? parseInt(element.style.gap as string) : 10}
                  >
                    <tbody>
                      <tr>
                        {element.socialLinks.map((link, i) => (
                          <td key={i}>
                            <a
                              href={link.url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={link.platform}
                              onClick={(e) => e.preventDefault()}
                            >
                              <img
                                src={`https://img.shields.io/badge/-${link.platform}-grey?logo=${link.platform.toLowerCase()}&style=social&label=`}
                                alt={link.platform}
                                width="32"
                                height="32"
                                style={{ borderRadius: "4px", display: "block" }}
                              />
                            </a>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      );
    case "code":
      return (
        <div
          className="custom-html-preview border border-dashed border-amber-400 bg-amber-50 p-2 my-1 overflow-auto text-xs"
          title="Custom HTML Preview (actual rendering may vary)"
          onClick={handleClick}
          dangerouslySetInnerHTML={{
            __html:
              element.content ||
              "<p class='text-gray-500'>[Empty HTML Block - Edit in Properties]</p>",
          }}
          style={emailSafeStyles}
        />
      );
    case "columns":
      return (
        <table
          role="presentation"
          border={0}
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ borderCollapse: "collapse", ...emailSafeStyles }}
        >
          <tbody>
            <tr>
              {element.columns?.map((columnContent, colIndex) => (
                <td
                  key={colIndex}
                  width={`${100 / (element.columns?.length || 1)}%`}
                  valign="top"
                  style={{
                    paddingLeft:
                      colIndex === 0
                        ? "0"
                        : element.style?.gap
                          ? `${parseInt(element.style.gap as string) / 2}px`
                          : "10px",
                    paddingRight:
                      colIndex === (element.columns?.length || 0) - 1
                        ? "0"
                        : element.style?.gap
                          ? `${parseInt(element.style.gap as string) / 2}px`
                          : "10px",
                    // Vertical padding can be added here (e.g., `paddingTop: '10px', paddingBottom: '10px'`) or controlled by elements within
                  }}
                  onClick={handleClick} // Click on column wrapper might select the column element itself
                >
                  <div className="column-inner-wrapper">
                    {" "}
                    {/* Optional: for styling column internals */}
                    {columnContent.map((colElement) => (
                      <div
                        key={colElement.id}
                        style={{ marginBottom: "10px" }}
                        className="column-element-item"
                      >
                        {" "}
                        {/* Wrapper for spacing between elements in a column */}
                        {/* For nested elements, we might not want them to be directly selectable if the parent column is selected.
                        Or, we pass down the onSelect prop if they should be individually selectable.
                        This example makes column elements render without their own top-level selection logic here.
                    */}
                        <RenderNewsletterElement
                          element={colElement}
                          viewMode={viewMode}
                          isSelected={isSelected}
                          onSelect={onSelect}
                        />
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      );
    default:
      return (
        <div
          className="text-xs text-red-500 p-2 border border-red-500 bg-red-50"
          onClick={handleClick}
        >
          Unknown element type: {(element as any).type}
        </div>
      );
  }
}

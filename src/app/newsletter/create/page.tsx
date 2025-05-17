"use client";

import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from "react";
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
  Loader2,
  FileText,
  Pilcrow,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Using shadcn/ui tooltips

// --- Constants ---
const ELEMENT_TYPES = [
  { type: "heading", icon: Heading, label: "Heading" },
  { type: "text", icon: Type, label: "Text" },
  { type: "passage", icon: Pilcrow, label: "Passage" },
  { type: "image", icon: ImageIcon, label: "Image" },
  { type: "button", icon: ButtonIcon, label: "Button" },
  { type: "divider", icon: Divider, label: "Divider" },
  { type: "spacer", icon: ArrowUpDown, label: "Spacer" },
  { type: "columns", icon: Columns, label: "Columns" },
  { type: "social", icon: Share2, label: "Social Icons" },
  { type: "code", icon: Braces, label: "HTML Code" },
];

const VIEW_MODES = [
  { mode: "mobile", icon: Smartphone, label: "Mobile" },
  { mode: "tablet", icon: Tablet, label: "Tablet" },
  { mode: "desktop", icon: Monitor, label: "Desktop" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["mode"];

// --- Utility Functions (Keep as is) ---
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
  let elementRemoved = false;
  const filteredTopLevel = elementsArray.filter((element) => {
    if (element.id === elementId) {
      elementRemoved = true;
      return false;
    }
    return true;
  });

  if (elementRemoved) return filteredTopLevel;

  return elementsArray
    .map((element) => {
      if (element.type === "columns" && element.columns) {
        const updatedColumns = element.columns.map((column) =>
          removeElementRecursive(elementId, column)
        );
        if (
          updatedColumns.some(
            (col, idx) => JSON.stringify(col) !== JSON.stringify(element.columns?.[idx])
          )
        ) {
          elementRemoved = true;
        }
        return { ...element, columns: updatedColumns };
      }
      return element;
    })
    .filter(Boolean);
};

// --- Custom Hooks (Keep useNewsletterHistory as is) ---
function useNewsletterHistory(initialElements: NewsletterElement[]) {
  const [history, setHistory] = useState<NewsletterElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateHistory = useCallback(
    (newElements: NewsletterElement[]) => {
      if (JSON.stringify(newElements) !== JSON.stringify(history[historyIndex])) {
        const newHistorySlice = history.slice(0, historyIndex + 1);
        setHistory([...newHistorySlice, newElements]);
        setHistoryIndex(newHistorySlice.length);
      }
    },
    [history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      toast.info("Undo successful");
      return history[historyIndex - 1];
    }
    // toast.error("Nothing to undo"); // This can be annoying if clicked accidentally
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      toast.info("Redo successful");
      return history[historyIndex + 1];
    }
    // toast.error("Nothing to redo");
    return null;
  }, [history, historyIndex]);

  const resetHistory = useCallback((elements: NewsletterElement[]) => {
    setHistory([elements]);
    setHistoryIndex(0);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return { history, updateHistory, undo, redo, canUndo, canRedo, resetHistory };
}

// DS Colors: Slate-700 for skeleton elements on a slate-800/900 background
function PageLoadingSkeleton() {
  return (
    <div className="h-screen w-full p-4 sm:p-6 space-y-6 flex flex-col bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Skeleton className="h-9 w-24 sm:w-36 rounded-md bg-slate-700" />
          <Skeleton className="h-9 w-40 sm:w-60 rounded-md bg-slate-700" />
          <div className="flex space-x-1">
            <Skeleton className="h-8 w-8 rounded-md bg-slate-700" />
            <Skeleton className="h-8 w-8 rounded-md bg-slate-700" />
          </div>
          <Skeleton className="h-8 w-20 sm:w-24 rounded-md bg-slate-700 hidden sm:block" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-20 sm:w-24 rounded-md bg-slate-700" />
          <Skeleton className="h-9 w-20 sm:w-24 rounded-md bg-slate-700" />
          <Skeleton className="h-9 w-28 sm:w-32 rounded-md bg-slate-700" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-0 h-[calc(100vh-150px)]">
        <Skeleton className="h-full rounded-md bg-slate-800 border-r border-slate-700" />
        <div className="flex items-center justify-center p-4 sm:p-6">
          <Skeleton className="h-full w-full max-w-2xl rounded-lg bg-slate-800 border border-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function NewsletterCreatePage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <NewsletterBuilder />
    </Suspense>
  );
}

function NewsletterBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateType = searchParams.get("template") || "blank";

  const [newsletterName, setNewsletterName] = useState("");
  const [elements, setElements] = useState<NewsletterElement[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"elements" | "properties" | "settings">("elements");

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailPreviewText, setEmailPreviewText] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("draft");

  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);
  const [newsletterId, setNewsletterId] = useState<string | null>(null);

  const { updateHistory, undo, redo, canUndo, canRedo, resetHistory } =
    useNewsletterHistory(elements);

  const [draggedItemType, setDraggedItemType] = useState<string | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const builderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageLoading(true);
    setApiError(null);
    const templateKey = templateType as keyof typeof newsletterTemplates;

    let initialElements: NewsletterElement[] = [];
    let initialName = "New Blank Newsletter";

    if (newsletterTemplates[templateKey]) {
      const template = newsletterTemplates[templateKey];
      initialName = `New ${template.name || "Newsletter"} - ${new Date().toLocaleTimeString()}`;
      initialElements = JSON.parse(JSON.stringify(template.elements));
    } else {
      toast.error(`Template "${templateType}" not found. Using blank template.`);
      initialElements = JSON.parse(JSON.stringify(newsletterTemplates.blank.elements));
      initialName = `New Blank Newsletter - ${new Date().toLocaleTimeString()}`;
      // setApiError(`Template "${templateType}" not found.`); // Don't block UI for this
    }

    setNewsletterName(initialName);
    setElements(initialElements);
    resetHistory(initialElements);

    setEmailSubject("");
    setEmailPreviewText("");
    setNewsletterStatus("draft");
    setSelectedElementId(null);
    setActiveTab("elements");
    setHasSavedOnce(false);
    setNewsletterId(null);
    setIsSaving(false);

    const timer = setTimeout(() => setPageLoading(false), 300); // Simulating load
    return () => clearTimeout(timer);
  }, [templateType, resetHistory]);

  useEffect(() => {
    if (!pageLoading) {
      updateHistory(elements);
    }
  }, [elements, pageLoading, updateHistory]);

  const handleUndo = () => {
    const prevElements = undo();
    if (prevElements) {
      setElements(prevElements);
      setSelectedElementId(null);
    }
  };

  const handleRedo = () => {
    const nextElements = redo();
    if (nextElements) {
      setElements(nextElements);
      setSelectedElementId(null);
    }
  };

  const getElementData = (id: string | null) => {
    if (!id) return null;
    return findElementRecursive(id, elements)?.element ?? null;
  };

  const selectedElementData = useMemo(
    () => getElementData(selectedElementId),
    [selectedElementId, elements]
  );

  const addElement = useCallback((type: string, targetIndex?: number) => {
    const newId = `${type}-${Date.now()}`;
    let newElement: NewsletterElement = { id: newId, type, style: {} };

    switch (type) {
      case "text":
        newElement.content = "Start typing your paragraph here...";
        newElement.style = {
          fontSize: "16px",
          color: "#CBD5E1",
          textAlign: "left",
          lineHeight: "1.6",
        }; // DS: Text Light
        break;
      case "passage":
        newElement.content =
          "This is a passage block. Ideal for longer form content that might include multiple paragraphs or more detailed explanations. You can style its line height, margins, and more.";
        newElement.style = {
          fontSize: "16px",
          color: "#CBD5E1", // DS: Text Light
          textAlign: "left",
          lineHeight: "1.7",
          margin: "16px 0", // DS Spacing 4
        };
        break;
      case "heading":
        newElement.content = "Main Heading";
        newElement.style = {
          fontSize: "28px", // Slightly smaller than h2 from DS
          fontWeight: "bold",
          color: "#E2E8F0", // Brighter for headings
          textAlign: "left",
          margin: "16px 0 8px 0",
        };
        break;
      case "image":
        newElement.src = "https://placehold.co/600x300/1E293B/94A3B8?text=Your+Image"; // Dark BG placeholder
        newElement.style = { width: "100%", margin: "0 auto" };
        newElement.alt = "Placeholder image";
        break;
      case "button":
        newElement.content = "Click Here";
        newElement.url = "#";
        newElement.style = {
          backgroundColor: "#10B981", // DS: Emerald-500
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "0.375rem", // DS: rounded-md
          textAlign: "center",
          fontWeight: "500", // Medium
          textDecoration: "none",
        };
        break;
      case "columns":
        newElement.columns = [
          [
            {
              id: `text-${Date.now()}-1`,
              type: "text",
              content: "Column 1 content...",
              style: { padding: "8px", color: "#CBD5E1" },
            },
          ],
          [
            {
              id: `text-${Date.now()}-2`,
              type: "text",
              content: "Column 2 content...",
              style: { padding: "8px", color: "#CBD5E1" },
            },
          ],
        ];
        newElement.style = { gap: "24px", margin: "16px 0" };
        break;
      case "divider":
        newElement.style = { borderTop: "1px solid #334155", margin: "24px 0" }; // DS: slate-700
        break;
      case "spacer":
        newElement.height = "32px"; // DS Spacing 8
        newElement.style = { height: "32px" };
        break;
      case "social":
        newElement.socialLinks = [
          { platform: "twitter", url: "#" },
          { platform: "facebook", url: "#" },
          { platform: "linkedin", url: "#" },
        ];
        newElement.style = { textAlign: "center", margin: "24px 0", gap: "16px" };
        break;
      case "code":
        newElement.content =
          "<p style='padding: 16px; background-color: #0F172A; border: 1px dashed #334155; color: #94A3B8; font-family: monospace;'>Your HTML code here</p>"; // DS: Slate-900 BG, Slate-700 Border, Slate-400 text
        break;
      default:
        return;
    }

    setElements((prev) => {
      const newElementsList = [...prev];
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
      toast.success("Element removed", { duration: 2000 });
    },
    [selectedElementId]
  );

  const duplicateElement = useCallback(
    (elementId: string) => {
      const findResult = findElementRecursive(elementId, elements);
      if (!findResult) return;
      const { element: elementToDuplicate } = findResult;
      const duplicateElementRecursiveFn = (el: NewsletterElement): NewsletterElement => {
        const newEl = JSON.parse(JSON.stringify(el));
        newEl.id = `${el.type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
        if (newEl.type === "columns" && newEl.columns) {
          newEl.columns = newEl.columns.map((col: NewsletterElement[]) =>
            col.map(duplicateElementRecursiveFn)
          );
        }
        return newEl;
      };
      const duplicatedElement = duplicateElementRecursiveFn(elementToDuplicate);
      setElements((prev) => {
        const newElementsState = [...prev];
        const parentInfo = findElementRecursive(elementId, newElementsState);
        if (parentInfo) {
          parentInfo.parentArray.splice(parentInfo.index + 1, 0, duplicatedElement);
          return newElementsState;
        }
        return prev;
      });
      setSelectedElementId(duplicatedElement.id);
      toast.success("Element duplicated", { duration: 2000 });
    },
    [elements]
  );

  const updateElement = useCallback((elementId: string, updates: Partial<NewsletterElement>) => {
    setElements((prev) =>
      updateElementRecursive(
        elementId,
        (el) => ({
          ...el,
          ...updates,
          style: updates.style ? { ...el.style, ...updates.style } : el.style,
        }),
        prev
      )
    );
  }, []);

  const addPersonalizationToElement = useCallback((elementId: string, fieldId: string) => {
    const field = personalizationOptions.find((opt) => opt.id === fieldId);
    if (!field) return;
    setElements((prev) =>
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
        prev
      )
    );
    toast.success(`Added ${field.label} personalization`);
  }, []);

  // Drag and Drop Handlers (Logic remains the same, classes will use DS)
  const handleSidebarDragStart = (e: React.DragEvent, type: string) => {
    setDraggedItemType(type);
    e.dataTransfer.setData("application/newsletter-element-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleSidebarDragEnd = () => setDraggedItemType(null);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItemType) e.dataTransfer.dropEffect = "copy";
    else if (draggingElementId) e.dataTransfer.dropEffect = "move";
    else e.dataTransfer.dropEffect = "none";
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData("application/newsletter-element-type");
    if (type && draggedItemType === type) {
      const builderRect = builderRef.current?.getBoundingClientRect();
      let insertAtIndex = elements.length;
      if (builderRect && elements.length > 0) {
        let closestDist = Infinity;
        elements.forEach((el, idx) => {
          const elDom = document.getElementById(`element-${el.id}`);
          if (elDom) {
            const elRect = elDom.getBoundingClientRect();
            const midY = elRect.top + elRect.height / 2;
            const dist = Math.abs(e.clientY - midY);
            if (dist < closestDist) {
              closestDist = dist;
              insertAtIndex = e.clientY < midY ? idx : idx + 1;
            }
          }
        });
      } else if (builderRect && elements.length === 0 && e.clientY > builderRect.top) {
        insertAtIndex = 0;
      }
      addElement(type, insertAtIndex);
      setDraggedItemType(null);
    }
    setDropTargetIndex(null);
    document
      .querySelectorAll(".drop-indicator-top, .drop-indicator-bottom")
      .forEach((el) => el.classList.remove("drop-indicator-top", "drop-indicator-bottom"));
  };

  const handleElementDragStart = (e: React.DragEvent, elementId: string) => {
    e.stopPropagation();
    setDraggingElementId(elementId);
    e.dataTransfer.setData("application/newsletter-element-id", elementId);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("opacity-30");
  };

  const handleElementDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("opacity-30");
    document
      .querySelectorAll(".drop-indicator-top, .drop-indicator-bottom")
      .forEach((el) => el.classList.remove("drop-indicator-top", "drop-indicator-bottom"));
    setDraggingElementId(null);
    setDropTargetIndex(null);
  };

  const handleElementDragOver = (e: React.DragEvent, targetElementIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingElementId) return;
    e.dataTransfer.dropEffect = "move";
    const sourceElementIndex = elements.findIndex((el) => el.id === draggingElementId);
    if (sourceElementIndex === -1) return;
    const targetHtmlElement = e.currentTarget as HTMLElement;
    document.querySelectorAll(".drop-indicator-top, .drop-indicator-bottom").forEach((el) => {
      if (el !== targetHtmlElement)
        el.classList.remove("drop-indicator-top", "drop-indicator-bottom");
    });
    const rect = targetHtmlElement.getBoundingClientRect();
    const verticalMidpoint = rect.top + rect.height / 2;
    const isOverTopHalf = e.clientY < verticalMidpoint;
    targetHtmlElement.classList.remove("drop-indicator-top", "drop-indicator-bottom");
    if (isOverTopHalf) {
      setDropTargetIndex(targetElementIndex);
      if (
        sourceElementIndex !== targetElementIndex &&
        sourceElementIndex !== targetElementIndex - 1
      )
        targetHtmlElement.classList.add("drop-indicator-top");
    } else {
      setDropTargetIndex(targetElementIndex + 1);
      if (
        sourceElementIndex !== targetElementIndex &&
        sourceElementIndex !== targetElementIndex + 1
      )
        targetHtmlElement.classList.add("drop-indicator-bottom");
    }
  };

  const handleElementDragLeave = (e: React.DragEvent) => {
    /* Often empty, cleanup in DragEnd/Over */
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
      dropTargetIndex === null
    ) {
      setDraggingElementId(null);
      setDropTargetIndex(null);
      return;
    }
    const sourceIndex = elements.findIndex((el) => el.id === sourceId);
    if (sourceIndex === -1) {
      setDraggingElementId(null);
      setDropTargetIndex(null);
      return;
    }
    const intendedInsertionPoint = dropTargetIndex;
    let actualFinalIndex = intendedInsertionPoint;
    if (sourceIndex < intendedInsertionPoint) actualFinalIndex = intendedInsertionPoint - 1;
    if (sourceIndex === actualFinalIndex) {
      setDraggingElementId(null);
      setDropTargetIndex(null);
      return;
    }
    setElements((prevElements) => {
      const newElementsArray = [...prevElements];
      const currentSourceIdx = newElementsArray.findIndex((el) => el.id === sourceId);
      if (currentSourceIdx === -1) return prevElements;
      const [movedElement] = newElementsArray.splice(currentSourceIdx, 1);
      let insertionIdx = intendedInsertionPoint;
      if (currentSourceIdx < intendedInsertionPoint) insertionIdx = intendedInsertionPoint - 1;
      insertionIdx = Math.max(0, Math.min(insertionIdx, newElementsArray.length));
      newElementsArray.splice(insertionIdx, 0, movedElement);
      return newElementsArray;
    });
    toast.success("Element reordered", { duration: 2000 });
    setSelectedElementId(sourceId);
    setDraggingElementId(null);
    setDropTargetIndex(null);
  };

  const handleSave = async () => {
    // ... (save logic as before, toast messages can use variants if available)
    setIsSaving(true);
    setApiError(null);

    if (!newsletterName.trim()) {
      toast.error("Newsletter name is required.");
      setApiError("Newsletter name is required.");
      setIsSaving(false);
      return;
    }
    if (!emailSubject.trim()) {
      toast.error("Email subject is required.");
      setApiError("Email subject is required.");
      setActiveTab("settings");
      setIsSaving(false);
      return;
    }

    try {
      const newsletterData = {
        name: newsletterName,
        elements,
        subject: emailSubject,
        previewText: emailPreviewText,
        status: newsletterStatus,
      };
      // const method = newsletterId ? "PUT" : "POST"; // If supporting update
      // const endpoint = newsletterId ? `/api/newsletters/${newsletterId}` : "/api/newsletters";
      const response = await fetch(`/api/newsletters`, {
        // Assuming create only on this page
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsletterData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);

      setNewsletterId(data.id);
      setHasSavedOnce(true);
      toast.success("Newsletter created successfully! Redirecting...");
      router.push(`/newsletter/${data.id}/edit`); // Redirect to edit page for the new ID
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred.";
      setApiError(errorMessage);
      toast.error(`Save failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExit = () => router.push("/dashboard/newsletters");

  if (pageLoading) return <PageLoadingSkeleton />;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-300">
      <header className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900 shadow-md sticky top-0 z-20">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Input
            value={newsletterName}
            onChange={(e) => setNewsletterName(e.target.value)}
            className="h-9 font-medium px-2 text-base w-[180px] sm:w-[250px] bg-slate-800 border-slate-700 focus:border-emerald-500 text-slate-100 placeholder:text-slate-500"
            placeholder="Newsletter Name..."
          />
          <div className="flex space-x-0 border-l border-slate-700 pl-2 sm:pl-3 ml-1 sm:ml-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                    onClick={handleUndo}
                    disabled={!canUndo}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                    onClick={handleRedo}
                    disabled={!canRedo}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Redo (Ctrl+Y)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="hidden sm:flex border border-slate-700 rounded-md p-0.5 bg-slate-800">
            {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
              <TooltipProvider key={mode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2 text-slate-400 hover:text-slate-100 data-[active=true]:bg-slate-700 data-[active=true]:text-emerald-400 data-[active=true]:shadow-sm`}
                      data-active={viewMode === mode}
                      onClick={() => setViewMode(mode as ViewMode)}
                    >
                      {" "}
                      <Icon className="h-4 w-4" />{" "}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{label} view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab(activeTab === "settings" ? "elements" : "settings")}
                  className={`border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100 h-9 ${activeTab === "settings" ? "bg-slate-700 text-emerald-400" : ""}`}
                >
                  <Settings className="h-4 w-4 mr-0 sm:mr-1" />{" "}
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Email Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (hasSavedOnce && newsletterId)
                      window.open(`/newsletters/preview/${newsletterId}`, "_blank");
                    else toast.warning("Save newsletter first to enable live preview.");
                  }}
                  disabled={!hasSavedOnce || !newsletterId}
                  className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100 h-9"
                >
                  <Eye className="h-4 w-4 mr-0 sm:mr-1" />{" "}
                  <span className="hidden sm:inline">Preview</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Live Preview (Requires Save)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className={`min-w-[110px] sm:min-w-[140px] h-9 ${hasSavedOnce ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-600 hover:bg-emerald-500"} text-white disabled:opacity-70`}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : hasSavedOnce ? "Saved" : "Save"}
          </Button>

          {/* <TooltipProvider><Tooltip><TooltipTrigger asChild>
              <Button variant="default" size="sm" onClick={() => toast.info("Send/Schedule feature coming soon!")} disabled={!hasSavedOnce || isSaving} className="bg-emerald-700 hover:bg-emerald-600 text-white h-9">
                <Send className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Publish</span>
              </Button>
          </TooltipTrigger><TooltipContent side="bottom"><p>Send or Schedule (Save First)</p></TooltipContent></Tooltip></TooltipProvider> */}
        </div>
      </header>

      {apiError && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 px-4 border-b border-red-500/30 flex justify-between items-center">
          <span>Error: {apiError}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
            onClick={() => setApiError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-slate-800 p-4 sm:p-6 border-b border-slate-700 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-100">Email Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab("elements")}
              className="h-8 w-8 text-slate-400 hover:bg-slate-700 hover:text-slate-100"
            >
              {" "}
              <X className="h-5 w-5" />{" "}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label
                htmlFor="emailSubject"
                className="text-sm font-medium text-slate-300 block mb-1.5"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Your catchy email subject"
                required
                className="h-10 bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label
                htmlFor="emailPreviewText"
                className="text-sm font-medium text-slate-300 block mb-1.5"
              >
                Preview Text
              </label>
              <Input
                id="emailPreviewText"
                value={emailPreviewText}
                onChange={(e) => setEmailPreviewText(e.target.value)}
                placeholder="Brief preview shown after subject"
                className="h-10 bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label
                htmlFor="newsletterStatus"
                className="text-sm font-medium text-slate-300 block mb-1.5"
              >
                Status
              </label>
              <Select value={newsletterStatus} onValueChange={setNewsletterStatus}>
                <SelectTrigger
                  id="newsletterStatus"
                  className="h-10 bg-slate-900 border-slate-700 text-slate-300 focus:border-emerald-500"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-300">
                  <SelectItem
                    value="draft"
                    className="hover:bg-slate-700 data-[state=checked]:bg-emerald-600"
                  >
                    Draft
                  </SelectItem>
                  <SelectItem
                    value="published"
                    className="hover:bg-slate-700 data-[state=checked]:bg-emerald-600"
                  >
                    Published
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-0 overflow-hidden">
        <aside className="bg-slate-800 p-4 overflow-y-auto border-r border-slate-700 flex flex-col">
          <Tabs
            value={activeTab === "settings" ? "elements" : activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid grid-cols-2 mb-4 sticky top-0 bg-slate-800 z-10 pt-1 border border-slate-700 rounded-md p-1 h-auto">
              <TabsTrigger
                value="elements"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-slate-400 rounded-sm py-1.5"
              >
                Elements
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                disabled={!selectedElementId}
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-slate-400 rounded-sm py-1.5 disabled:opacity-50"
              >
                Properties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="text-sm font-semibold text-slate-400">Content Blocks</div>
              <div className="grid grid-cols-2 gap-2.5">
                {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
                  <div
                    key={type}
                    className="flex flex-col items-center justify-center p-3 border border-slate-700 rounded-md cursor-grab bg-slate-700 hover:bg-slate-600/80 active:cursor-grabbing active:opacity-80 active:border-emerald-500/50 transition-colors"
                    draggable
                    onDragStart={(e) => handleSidebarDragStart(e, type)}
                    onDragEnd={handleSidebarDragEnd}
                    onClick={() => addElement(type)}
                    title={`Add ${label}`}
                  >
                    <Icon className="h-5 w-5 mb-1.5 text-emerald-400" />
                    <span className="text-xs text-center text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-700 pt-4">
                <div className="text-sm font-semibold text-slate-400 mb-2">Personalization</div>
                <div className="space-y-2">
                  {personalizationOptions.map((field) => (
                    <Button
                      key={field.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 disabled:opacity-60"
                      onClick={() => {
                        if (
                          selectedElementId &&
                          (selectedElementData?.type === "text" ||
                            selectedElementData?.type === "heading" ||
                            selectedElementData?.type === "passage")
                        )
                          addPersonalizationToElement(selectedElementId, field.id);
                        else
                          toast.error("Select a Text, Heading, or Passage element first", {
                            duration: 2000,
                          });
                      }}
                      disabled={
                        !selectedElementId ||
                        (selectedElementData?.type !== "text" &&
                          selectedElementData?.type !== "heading" &&
                          selectedElementData?.type !== "passage")
                      }
                    >
                      <PersonalizationIcon className="h-3.5 w-3.5 mr-2 text-emerald-400" /> Insert{" "}
                      {field.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-5 flex-1 overflow-y-auto pb-10 pr-1">
              {selectedElementId && selectedElementData ? (
                <PropertiesPanel
                  key={selectedElementId}
                  element={selectedElementData}
                  onUpdate={(updates) => updateElement(selectedElementId, updates)}
                  onRemove={() => removeElement(selectedElementId)}
                  onDuplicate={() => duplicateElement(selectedElementId)}
                />
              ) : (
                <div className="text-center p-8 text-slate-500 flex flex-col items-center justify-center h-full">
                  <Menu className="h-12 w-12 mb-4 text-slate-600" />
                  <p className="font-medium text-slate-400">Select an element</p>
                  <p className="text-sm">
                    Click on an element in the canvas to edit its properties.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </aside>

        <main
          className="bg-slate-900 p-4 sm:p-6 overflow-y-auto flex justify-center items-start"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          <div
            ref={builderRef}
            className={`newsletter-canvas transition-all duration-300 bg-slate-800 shadow-xl border border-slate-700 rounded-lg w-full min-h-[600px] relative 
            ${viewMode === "desktop" ? "max-w-3xl" : viewMode === "tablet" ? "max-w-xl" : "max-w-sm"} ${viewMode !== "desktop" ? "mx-auto" : ""}
          `}
            style={{ padding: "20px" }}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
          >
            {viewMode !== "desktop" && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center bg-slate-700 text-slate-200 text-xs py-1 px-3 rounded-t-md shadow-lg">
                {viewMode === "tablet" ? (
                  <Tablet className="h-3.5 w-3.5 mr-1.5" />
                ) : (
                  <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                )}
                {viewMode === "tablet" ? "Tablet Preview (768px)" : "Mobile Preview (375px)"}
              </div>
            )}
            {elements.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-500 p-10 pointer-events-none">
                <Layout className="h-16 w-16 mb-4 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-400 mb-1">Build Your Newsletter</h3>
                <p className="text-sm">
                  Drag elements from the left panel or click to add them here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    id={`element-${element.id}`}
                    className={`element-wrapper relative group transition-all duration-150 rounded 
                      ${selectedElementId === element.id ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-800" : "hover:bg-slate-700/40"} 
                      ${draggingElementId === element.id ? "opacity-30 dragging-active" : ""}`}
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
                    style={{ padding: "2px", minHeight: "30px", position: "relative" }}
                  >
                    <div
                      className={`absolute top-0.5 right-0.5 hidden group-hover:flex group-focus-within:flex ${selectedElementId === element.id ? "!flex" : ""} items-center bg-slate-700 shadow-lg border border-slate-600 rounded p-0.5 z-10 space-x-0.5`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-emerald-400 hover:bg-slate-600"
                              onClick={() => duplicateElement(element.id)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Duplicate</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-slate-600"
                              onClick={() => removeElement(element.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div
                      className={`absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-[calc(100%+4px)] hidden group-hover:flex group-focus-within:flex ${selectedElementId === element.id ? "!flex" : ""} items-center bg-slate-700 shadow-lg border border-slate-600 rounded-full p-1 z-10 cursor-move`}
                      title="Drag to reorder"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Menu className="h-4 w-4 text-slate-400" />
                    </div>
                    <RenderNewsletterElement element={element} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .element-wrapper.drop-indicator-top::before {
          content: "";
          display: block;
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #10b981; /* DS: Emerald-500 */
          border-radius: 2px;
          z-index: 20;
          animation: pulse-indicator 1.2s infinite ease-in-out;
          box-shadow: 0 0 5px #10b981;
        }
        .element-wrapper.drop-indicator-bottom::after {
          content: "";
          display: block;
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #10b981; /* DS: Emerald-500 */
          border-radius: 2px;
          z-index: 20;
          animation: pulse-indicator 1.2s infinite ease-in-out;
          box-shadow: 0 0 5px #10b981;
        }
        @keyframes pulse-indicator {
          0%,
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.6;
            transform: scaleY(0.75);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-html-preview > * {
          margin: 0 !important; /* Attempt to normalize email client behavior in preview */
        }
        .newsletter-canvas ::selection {
          background-color: #059669;
          color: #f0fdf4; /* DS: Emerald-600 with light text */
        }
      `}</style>
    </div>
  );
}

interface PropertiesPanelProps {
  element: NewsletterElement;
  onUpdate: (updates: Partial<NewsletterElement>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

function PropertiesPanel({ element, onUpdate, onRemove, onDuplicate }: PropertiesPanelProps) {
  const ElementIcon = ELEMENT_TYPES.find((et) => et.type === element.type)?.icon || Layout;
  const handleStyleChange = (property: string, value: string) => {
    onUpdate({ style: { ...element.style, [property]: value } });
  };
  const handlePropChange = (prop: keyof NewsletterElement, value: any) => {
    onUpdate({ [prop]: value });
  };

  const dsInputClass =
    "h-9 text-sm bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30";
  const dsTextareaClass =
    "text-sm bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30 min-h-[60px]";
  const dsLabelClass = "text-xs font-medium text-slate-400 block mb-1";

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-400">
            {" "}
            <ElementIcon className="h-4 w-4" />{" "}
          </div>
          <span className="text-sm font-semibold capitalize text-slate-200">
            {element.type} Properties
          </span>
        </div>
        <div className="flex items-center space-x-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-emerald-400 hover:bg-slate-700"
                  onClick={onDuplicate}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-slate-700"
                  onClick={onRemove}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {(element.type === "text" || element.type === "heading" || element.type === "passage") && (
        <div className="space-y-1">
          <label className={dsLabelClass}>Text Content</label>
          <Textarea
            value={element.content || ""}
            onChange={(e) => handlePropChange("content", e.target.value)}
            rows={element.type === "heading" ? 2 : element.type === "passage" ? 8 : 4}
            className={dsTextareaClass}
          />
        </div>
      )}
      {element.type === "button" && (
        <>
          <div className="space-y-1">
            {" "}
            <label className={dsLabelClass}>Button Text</label>{" "}
            <Input
              value={element.content || ""}
              onChange={(e) => handlePropChange("content", e.target.value)}
              className={dsInputClass}
            />{" "}
          </div>
          <div className="space-y-1">
            {" "}
            <label className={dsLabelClass}>Link URL</label>{" "}
            <Input
              type="url"
              value={element.url || ""}
              placeholder="https://example.com"
              onChange={(e) => handlePropChange("url", e.target.value)}
              className={dsInputClass}
            />{" "}
          </div>
        </>
      )}
      {element.type === "image" && (
        <>
          <div className="space-y-1">
            {" "}
            <label className={dsLabelClass}>Image URL</label>{" "}
            <Input
              type="url"
              value={element.src || ""}
              placeholder="https://..."
              onChange={(e) => handlePropChange("src", e.target.value)}
              className={dsInputClass}
            />{" "}
          </div>
          {element.src && (
            <img
              src={element.src}
              alt="Preview"
              className="mt-2 rounded border border-slate-700 p-1 max-w-[150px] max-h-[100px] object-contain bg-slate-700/30"
            />
          )}
          <div className="space-y-1 mt-2">
            {" "}
            <label className={dsLabelClass}>Alt Text</label>{" "}
            <Input
              value={element.alt || ""}
              placeholder="Describe image for accessibility"
              onChange={(e) => handlePropChange("alt", e.target.value)}
              className={dsInputClass}
            />{" "}
          </div>
        </>
      )}
      {element.type === "social" && (
        <div className="space-y-3">
          <label className={`${dsLabelClass} mb-2`}>Social Links</label>
          {(element.socialLinks || []).map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-xs capitalize w-20 shrink-0 text-slate-400">
                {link.platform}:
              </span>
              <Input
                type="url"
                value={link.url || ""}
                placeholder={`Link for ${link.platform}`}
                onChange={(e) => {
                  const newLinks = [...(element.socialLinks || [])];
                  newLinks[index] = { ...newLinks[index], url: e.target.value };
                  handlePropChange("socialLinks", newLinks);
                }}
                className={`${dsInputClass} text-xs`}
              />
            </div>
          ))}
          {/* Add button to add more social links could go here */}
        </div>
      )}
      {element.type === "code" && (
        <div className="space-y-1">
          <label className={dsLabelClass}>Custom HTML</label>
          <Textarea
            value={element.content || ""}
            onChange={(e) => handlePropChange("content", e.target.value)}
            rows={10}
            className={`${dsTextareaClass} font-mono text-xs leading-relaxed tracking-wider`}
          />
          <p className="text-xs text-yellow-400 bg-yellow-700/30 p-2 rounded-md border border-yellow-600/50 mt-1">
            Warning: Test thoroughly. Invalid HTML can break rendering.
          </p>
        </div>
      )}

      <div className="space-y-4 border-t border-slate-700 pt-4 mt-4">
        <label className={`${dsLabelClass} font-semibold text-slate-300 text-sm`}>Styling</label>
        {(element.type === "text" || element.type === "heading" || element.type === "passage") && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <PropertyInput
              label="Font Size"
              value={(element.style?.fontSize as string) || ""}
              onChange={(v) => handleStyleChange("fontSize", v)}
              placeholder="e.g., 16px or 1.2rem"
              type="text"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
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
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertySelect
              label="Font Weight"
              value={(element.style?.fontWeight as string) || "normal"}
              onChange={(v) => handleStyleChange("fontWeight", v)}
              options={[
                { value: "300", label: "Light" },
                { value: "normal", label: "Normal (400)" },
                { value: "500", label: "Medium" },
                { value: "bold", label: "Bold (700)" },
              ]}
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyColorInput
              label="Text Color"
              value={element.style?.color || "#CBD5E1"}
              onChange={(v) => handleStyleChange("color", v)}
              dsLabelClass={dsLabelClass}
              dsInputClass={dsInputClass}
            />
            <PropertyInput
              label="Line Height"
              value={
                (element.style?.lineHeight as string) ||
                (element.type === "passage" ? "1.7" : "normal")
              }
              onChange={(v) => handleStyleChange("lineHeight", v)}
              placeholder="e.g., 1.6 or normal"
              type="text"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyInput
              label="Margins (T R B L)"
              value={(element.style?.margin as string) || "0"}
              onChange={(v) => handleStyleChange("margin", v)}
              placeholder="e.g., 10px 0 or 16px"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
          </div>
        )}
        {element.type === "button" && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <PropertyColorInput
              label="Background"
              value={element.style?.backgroundColor || "#10B981"}
              onChange={(v) => handleStyleChange("backgroundColor", v)}
              dsLabelClass={dsLabelClass}
              dsInputClass={dsInputClass}
            />
            <PropertyColorInput
              label="Text Color"
              value={element.style?.color || "#ffffff"}
              onChange={(v) => handleStyleChange("color", v)}
              dsLabelClass={dsLabelClass}
              dsInputClass={dsInputClass}
            />
            <PropertySelect
              label="Font Weight"
              value={(element.style?.fontWeight as string) || "500"}
              onChange={(v) => handleStyleChange("fontWeight", v)}
              options={[
                { value: "normal", label: "Normal" },
                { value: "500", label: "Medium" },
                { value: "bold", label: "Bold" },
              ]}
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertySelect
              label="Alignment"
              value={element.style?.textAlign || "center"}
              onChange={(v) => handleStyleChange("textAlign", v)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyInput
              label="Padding (Y X)"
              value={(element.style?.padding as string) || "12px 24px"}
              onChange={(v) => handleStyleChange("padding", v)}
              placeholder="10px 20px"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyInput
              label="Border Radius"
              value={(element.style?.borderRadius as string) || "6px"}
              onChange={(v) => handleStyleChange("borderRadius", v)}
              placeholder="6px"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
          </div>
        )}
        {element.type === "image" && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <PropertySelect
              label="Width"
              value={(element.style?.width as string) || "100%"}
              onChange={(v) => handleStyleChange("width", v)}
              options={["25%", "33%", "50%", "66%", "75%", "100%", "auto"].map((o) => ({
                value: o,
                label: o,
              }))}
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertySelect
              label="Alignment"
              value={
                (element.style?.margin as string)?.includes("auto")
                  ? "center"
                  : (element.style?.margin as string)?.endsWith("0 auto")
                    ? "right"
                    : "left"
              }
              onChange={(v) => {
                if (v === "center") handleStyleChange("margin", "0 auto");
                else if (v === "right") handleStyleChange("margin", "0 0 0 auto");
                else handleStyleChange("margin", "0");
              }}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyInput
              label="Margins (T R B L)"
              value={(element.style?.margin as string) || "0"}
              onChange={(v) => handleStyleChange("margin", v)}
              placeholder="e.g., 10px auto"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyInput
              label="Border Radius"
              value={(element.style?.borderRadius as string) || "0px"}
              onChange={(v) => handleStyleChange("borderRadius", v)}
              placeholder="e.g., 8px"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
          </div>
        )}
        {element.type === "divider" && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <PropertySelect
              label="Style"
              value={(element.style?.borderTopStyle as string) || "solid"}
              onChange={(v) => handleStyleChange("borderTopStyle", v)}
              options={[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
              ]}
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyInput
              label="Thickness"
              value={(element.style?.borderTopWidth as string) || "1px"}
              onChange={(v) => handleStyleChange("borderTopWidth", v)}
              placeholder="1px"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
            <PropertyColorInput
              label="Color"
              value={(element.style?.borderTopColor as string) || "#334155"}
              onChange={(v) => handleStyleChange("borderTopColor", v)}
              dsLabelClass={dsLabelClass}
              dsInputClass={dsInputClass}
            />
            <PropertyInput
              label="Margins (Y X)"
              value={(element.style?.margin as string) || "24px 0"}
              onChange={(v) => handleStyleChange("margin", v)}
              placeholder="24px 0"
              dsInputClass={dsInputClass}
              dsLabelClass={dsLabelClass}
            />
          </div>
        )}
        {element.type === "spacer" && (
          <PropertyInput
            label="Height"
            value={(element.style?.height as string) || element.height || "32px"}
            onChange={(v) => {
              handleStyleChange("height", v);
              handlePropChange("height", v);
            }}
            placeholder="32px"
            dsInputClass={dsInputClass}
            dsLabelClass={dsLabelClass}
          />
        )}
      </div>
    </div>
  );
}

// Helper components for PropertiesPanel - Now accept DS classes
const PropertyInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dsInputClass,
  dsLabelClass,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  dsInputClass: string;
  dsLabelClass: string;
}) => (
  <div className="space-y-1">
    {" "}
    <label className={dsLabelClass}>{label}</label>{" "}
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={dsInputClass}
    />{" "}
  </div>
);
const PropertyColorInput = ({
  label,
  value,
  onChange,
  dsInputClass,
  dsLabelClass,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dsInputClass: string;
  dsLabelClass: string;
}) => (
  <div className="space-y-1">
    {" "}
    <label className={dsLabelClass}>{label}</label>{" "}
    <Input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${dsInputClass} p-1 h-10`}
    />{" "}
  </div>
);
const PropertySelect = ({
  label,
  value,
  onChange,
  options,
  dsInputClass,
  dsLabelClass,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  dsInputClass: string;
  dsLabelClass: string;
}) => (
  <div className="space-y-1">
    {" "}
    <label className={dsLabelClass}>{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${dsInputClass} h-9`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700 text-slate-300 rounded-md">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="hover:bg-slate-700 data-[state=checked]:bg-emerald-600 data-[highlighted]:bg-slate-700"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// --- RenderNewsletterElement (Adjust default colors if needed) ---
interface RenderNewsletterElementProps {
  element: NewsletterElement;
  viewMode: ViewMode;
}
function RenderNewsletterElement({ element }: RenderNewsletterElementProps) {
  const commonStyles: React.CSSProperties = {
    margin: element.style?.margin ?? "0",
    padding: element.style?.padding ?? "0",
    wordBreak: "break-word",
    ...element.style,
  };

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
      ); // Removed commonStyles from main style as it conflicts
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
    case "social":
      if (!element.socialLinks || element.socialLinks.length === 0)
        return (
          <p
            style={{
              ...commonStyles,
              textAlign: (commonStyles.textAlign as any) || "center",
              fontStyle: "italic",
              color: "#64748B",
            }}
          >
            No social links configured.
          </p>
        ); // Slate-500
      return (
        <table
          border={0}
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ ...commonStyles, margin: commonStyles.margin || "24px 0" }}
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
                <div style={{ display: "inline-block" }}>
                  <table
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
                                src={`https://img.shields.io/badge/-${link.platform}-${commonStyles.color || "10B981"}?logo=${link.platform}&style=for-the-badge&logoColor=white`}
                                alt={link.platform}
                                width="auto"
                                height="28"
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
          className="custom-html-preview my-1 overflow-hidden"
          title="Custom HTML Preview (styling may differ in email client)"
          dangerouslySetInnerHTML={{
            __html:
              element.content ||
              "<p class='text-xs text-slate-500 p-2 border border-dashed border-slate-600 bg-slate-700/30'>[Empty HTML Block]</p>",
          }}
          style={commonStyles}
        />
      );
    case "columns":
      return (
        <table
          border={0}
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ borderCollapse: "collapse", ...commonStyles }}
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
                  }}
                >
                  <div className="column-cell-inner">
                    {" "}
                    {columnContent.map((colElement) => (
                      <div key={colElement.id} style={{ marginBottom: "10px" }}>
                        <RenderNewsletterElement
                          element={colElement}
                          viewMode={"desktop" /*viewMode passed down*/}
                        />
                      </div>
                    ))}{" "}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      );
    default:
      return (
        <div className="text-xs text-red-500 p-2 border border-red-500 bg-red-500/10">
          Unknown element type: {(element as any).type}
        </div>
      );
  }
}

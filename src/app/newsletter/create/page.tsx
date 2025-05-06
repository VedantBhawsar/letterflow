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
  FileText, // <-- IMPORTED FOR PASSAGE
  Pilcrow, // <-- Alternative for Passage, or keep FileText
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

// --- Tooltip Fallback Components (Keep as is) ---
const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;
const Tooltip = ({ children }: { children: React.ReactNode }) => children;
const TooltipTrigger = ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) =>
  children;
const TooltipContent = ({ children }: { children: React.ReactNode }) => null;
// --- End Tooltip Fallbacks ---

// --- Constants ---
const ELEMENT_TYPES = [
  { type: "heading", icon: Heading, label: "Heading" },
  { type: "text", icon: Type, label: "Text" },
  { type: "passage", icon: FileText, label: "Passage" }, // <-- ADDED PASSAGE ELEMENT
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
        // Check if any column actually changed to mark elementRemoved
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
    toast.error("Nothing to undo");
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      toast.info("Redo successful");
      return history[historyIndex + 1];
    }
    toast.error("Nothing to redo");
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

// --- Page Loading Skeleton (Keep as is) ---
function PageLoadingSkeleton() {
  return (
    <div className="h-screen w-full p-6 space-y-6 flex flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-60 rounded-md" />
          <div className="flex space-x-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 h-[calc(100vh-150px)]">
        <Skeleton className="h-full rounded-md bg-muted/30" />
        <div className="md:col-span-4 bg-white flex items-center justify-center p-6">
          <Skeleton className="h-full w-full max-w-2xl rounded-lg bg-gray-50" />
        </div>
      </div>
    </div>
  );
}

// --- NewsletterCreatePage (Keep as is) ---
export default function NewsletterCreatePage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <NewsletterBuilder />
    </Suspense>
  );
}

// --- NewsletterBuilder (Main Component with modifications) ---
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

  // Drag and Drop State
  const [draggedItemType, setDraggedItemType] = useState<string | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  // dropTargetIndex now represents the intended *insertion index* in the array.
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const builderRef = useRef<HTMLDivElement>(null);

  // Initialization Effect (Keep as is)
  useEffect(() => {
    setPageLoading(true);
    setApiError(null);
    const templateKey = templateType as keyof typeof newsletterTemplates;

    let initialElements: NewsletterElement[] = [];
    let initialName = "New Blank Newsletter";

    if (newsletterTemplates[templateKey]) {
      const template = newsletterTemplates[templateKey];
      initialName = `New ${template.name || "Newsletter"}`;
      initialElements = JSON.parse(JSON.stringify(template.elements));
    } else {
      toast.error(`Template "${templateType}" not found. Using blank template.`);
      initialElements = JSON.parse(JSON.stringify(newsletterTemplates.blank.elements));
      setApiError(`Template "${templateType}" not found.`);
    }

    setNewsletterName(initialName);
    setElements(initialElements);
    resetHistory(initialElements); // Initialize history with initial elements

    setEmailSubject("");
    setEmailPreviewText("");
    setNewsletterStatus("draft");
    setSelectedElementId(null);
    setActiveTab("elements");
    setHasSavedOnce(false);
    setNewsletterId(null);
    setIsSaving(false);

    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, [templateType, resetHistory]);

  // Update history when elements change (Keep as is)
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
        newElement.content = "Add your text here";
        newElement.style = { fontSize: "16px", color: "#333333", textAlign: "left" };
        break;
      case "passage": // <-- ADDED PASSAGE
        newElement.content =
          "Write your passage here. This is a block of text that can span multiple lines and paragraphs.";
        newElement.style = {
          fontSize: "16px",
          color: "#333333",
          textAlign: "left",
          lineHeight: "1.6",
          margin: "10px 0",
        };
        break;
      case "heading":
        newElement.content = "Heading";
        newElement.style = {
          fontSize: "24px",
          fontWeight: "bold",
          color: "#111111",
          textAlign: "left",
        };
        break;
      case "image":
        newElement.src = "https://placehold.co/600x300/e2e8f0/a0aec0?text=Image";
        newElement.style = { width: "100%", margin: "0 auto" };
        newElement.alt = "Placeholder image";
        break;
      case "button":
        newElement.content = "Click Me";
        newElement.url = "#";
        newElement.style = {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          padding: "10px 20px",
          borderRadius: "4px",
          textAlign: "center",
          fontWeight: "normal",
        };
        break;
      case "columns":
        newElement.columns = [
          [
            {
              id: `text-${Date.now()}-1`,
              type: "text",
              content: "Column 1",
              style: { padding: "5px" },
            },
          ],
          [
            {
              id: `text-${Date.now()}-2`,
              type: "text",
              content: "Column 2",
              style: { padding: "5px" },
            },
          ],
        ];
        newElement.style = { gap: "20px" };
        break;
      case "divider":
        newElement.style = { borderTop: "1px solid #e5e7eb", margin: "20px 0" };
        break;
      case "spacer":
        newElement.height = "40px";
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
          "<p style='padding: 15px; background-color: #f9fafb; border: 1px dashed #d1d5db;'>Your HTML code here</p>";
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
      toast.success("Element removed");
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
      toast.success("Element duplicated");
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

  const addPersonalizationToElement = useCallback(
    (elementId: string, fieldId: string) => {
      const field = personalizationOptions.find((opt) => opt.id === fieldId);
      if (!field) return;

      setElements((prev) =>
        updateElementRecursive(
          elementId,
          (el) => {
            if (el.type === "text" || el.type === "heading" || el.type === "passage") {
              // <-- Include passage
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
    },
    [] // updateElement removed from dependencies as setElements with updater is used directly
  );

  // --- Drag and Drop Handlers ---
  const handleSidebarDragStart = (e: React.DragEvent, type: string) => {
    setDraggedItemType(type);
    e.dataTransfer.setData("application/newsletter-element-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleSidebarDragEnd = () => setDraggedItemType(null);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedItemType) {
      e.dataTransfer.dropEffect = "copy";
    } else if (draggingElementId) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent dropping on elements below if canvas is target
    const type = e.dataTransfer.getData("application/newsletter-element-type");
    if (type && draggedItemType === type) {
      // Determine drop index on canvas (e.g., based on mouse Y relative to builderRef)
      // For simplicity, adding to end or a predefined spot if not over an element.
      // This example adds to the end of the main elements list.
      const builderRect = builderRef.current?.getBoundingClientRect();
      let insertAtIndex = elements.length; // Default to end

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
              if (e.clientY < midY) {
                insertAtIndex = idx;
              } else {
                insertAtIndex = idx + 1;
              }
            }
          }
        });
      } else if (builderRect && elements.length === 0 && e.clientY > builderRect.top) {
        insertAtIndex = 0; // If canvas is empty, drop at the beginning
      }

      addElement(type, insertAtIndex);
      setDraggedItemType(null);
    }
    // If draggingElementId is set, this drop is likely handled by handleElementDrop.
    // Resetting dropTargetIndex here if it's a canvas drop might be needed if element drop doesn't fire.
    setDropTargetIndex(null);
    document
      .querySelectorAll(".drop-indicator-top, .drop-indicator-bottom")
      .forEach((el) => el.classList.remove("drop-indicator-top", "drop-indicator-bottom"));
  };

  const handleElementDragStart = (e: React.DragEvent, elementId: string) => {
    e.stopPropagation(); // Prevent canvas drag start if applicable
    setDraggingElementId(elementId);
    e.dataTransfer.setData("application/newsletter-element-id", elementId);
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).classList.add("opacity-50");
  };

  const handleElementDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("opacity-50", "border-primary", "border-2"); // "border-primary", "border-2" are not added in start, consider removing

    // Clear all indicators from any element
    document
      .querySelectorAll(".drop-indicator-top, .drop-indicator-bottom")
      .forEach((el) => el.classList.remove("drop-indicator-top", "drop-indicator-bottom"));

    setDraggingElementId(null);
    setDropTargetIndex(null);
  };

  const handleElementDragOver = (e: React.DragEvent, targetElementIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to parent canvas dragOver
    if (!draggingElementId) return;

    e.dataTransfer.dropEffect = "move";

    const sourceElementIndex = elements.findIndex((el) => el.id === draggingElementId);
    if (sourceElementIndex === -1) return; // Should not happen

    const targetHtmlElement = e.currentTarget as HTMLElement;

    // Clear indicators from other elements before setting new one
    document.querySelectorAll(".drop-indicator-top, .drop-indicator-bottom").forEach((el) => {
      if (el !== targetHtmlElement) {
        el.classList.remove("drop-indicator-top", "drop-indicator-bottom");
      }
    });

    const rect = targetHtmlElement.getBoundingClientRect();
    const verticalMidpoint = rect.top + rect.height / 2;
    const isOverTopHalf = e.clientY < verticalMidpoint;

    targetHtmlElement.classList.remove("drop-indicator-top", "drop-indicator-bottom"); // Clear from current target first

    if (isOverTopHalf) {
      // Trying to drop *before* the targetElementIndex
      setDropTargetIndex(targetElementIndex);
      // Don't show indicator if it would result in no move
      if (
        sourceElementIndex !== targetElementIndex &&
        sourceElementIndex !== targetElementIndex - 1
      ) {
        targetHtmlElement.classList.add("drop-indicator-top");
      }
    } else {
      // Trying to drop *after* the targetElementIndex
      setDropTargetIndex(targetElementIndex + 1);
      // Don't show indicator if it would result in no move
      if (
        sourceElementIndex !== targetElementIndex &&
        sourceElementIndex !== targetElementIndex + 1
      ) {
        targetHtmlElement.classList.add("drop-indicator-bottom");
      }
    }
  };

  const handleElementDragLeave = (e: React.DragEvent) => {
    // Only remove indicators if the mouse is truly leaving the area of potential drop indicators for this element
    // More robust cleanup is in DragEnd and DragOver of another element
    // (e.currentTarget as HTMLElement).classList.remove("drop-indicator-top", "drop-indicator-bottom");
  };

  const handleElementDrop = (
    e: React.DragEvent,
    // This index is the index of the element *being dropped onto*.
    // We rely on `dropTargetIndex` state which is more precise (before/after).
    _targetElementIndexUnderMouse: number
  ) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent canvas drop handler

    const sourceId = e.dataTransfer.getData("application/newsletter-element-id");

    // Clear indicators from the specific element dropped on
    (e.currentTarget as HTMLElement).classList.remove(
      "drop-indicator-top",
      "drop-indicator-bottom"
    );
    // And globally, just in case (though DragEnd should also cover this)
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

    // `dropTargetIndex` is the intended insertion point in the original array.
    const intendedInsertionPoint = dropTargetIndex;

    // Calculate the actual insertion index in the array *after* source element removal.
    let actualFinalIndex = intendedInsertionPoint;
    if (sourceIndex < intendedInsertionPoint) {
      actualFinalIndex = intendedInsertionPoint - 1;
    }

    // If the element isn't actually moving, it's a no-op.
    if (sourceIndex === actualFinalIndex) {
      setDraggingElementId(null);
      setDropTargetIndex(null);
      return; // No change, no toast
    }

    setElements((prevElements) => {
      const newElementsArray = [...prevElements];
      // Re-find source index in prevElements for safety, though it should be same as `sourceIndex` from closure
      const currentSourceIdx = newElementsArray.findIndex((el) => el.id === sourceId);
      if (currentSourceIdx === -1) return prevElements; // Should not happen

      const [movedElement] = newElementsArray.splice(currentSourceIdx, 1);

      // Re-calculate insertion index based on currentSourceIdx and intendedInsertionPoint
      // This is because intendedInsertionPoint was based on `elements` from outer scope.
      let insertionIdx = intendedInsertionPoint;
      if (currentSourceIdx < intendedInsertionPoint) {
        insertionIdx = intendedInsertionPoint - 1;
      }
      // Ensure insertion index is within bounds of the modified array
      insertionIdx = Math.max(0, Math.min(insertionIdx, newElementsArray.length));

      newElementsArray.splice(insertionIdx, 0, movedElement);
      return newElementsArray;
    });

    toast.success("Element reordered");
    setSelectedElementId(sourceId);
    setDraggingElementId(null);
    setDropTargetIndex(null);
  };

  // --- Save Handler (Keep as is) ---
  const handleSave = async () => {
    if (hasSavedOnce && newsletterId) {
      toast.info("Newsletter already saved. To update, go to the edit page.");
      router.push(`/newsletter/${newsletterId}`);
      return;
    }
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

      // Sticking to create-only for this component as implied by name "NewsletterCreatePage"
      const response = await fetch(`/api/newsletters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsletterData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);

      setNewsletterId(data.id);
      setHasSavedOnce(true); // Mark as saved
      toast.success("Newsletter created successfully! Redirecting...");
      // Redirect to an edit page or a view page for the newly created newsletter
      if (data.id)
        router.push(`/newsletter/${data.id}`); // Assuming /newsletter/:id is the edit/view page
      else router.push("/dashboard/newsletters"); // Fallback
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

  // --- JSX Structure (Mostly as is, with DnD props and selected element checks) ---
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Toolbar (Keep as is) */}
      <header className="flex items-center justify-between p-3 border-b bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Input
            value={newsletterName}
            onChange={(e) => setNewsletterName(e.target.value)}
            className="h-9 font-medium px-2 text-base w-[250px] border-transparent focus:border-input hover:border-gray-300"
            placeholder="Newsletter Name..."
          />
          <div className="flex space-x-1 border-l pl-3 ml-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleUndo}
                    disabled={!canUndo}
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
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRedo}
                    disabled={!canRedo}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex border rounded-md p-[2px] bg-muted/60">
            {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
              <TooltipProvider key={mode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === mode ? "secondary" : "ghost"}
                      size="sm"
                      className={`h-7 px-2 ${viewMode === mode ? "shadow-sm" : ""}`}
                      onClick={() => setViewMode(mode as ViewMode)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{label} view</TooltipContent>
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
                  onClick={() => {
                    if (hasSavedOnce && newsletterId)
                      window.open(`/newsletter/preview/${newsletterId}`, "_blank");
                    else toast.warning("Save newsletter first to preview.");
                  }}
                  disabled={!hasSavedOnce || !newsletterId}
                >
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview (requires save)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || hasSavedOnce} // Keep disabled if already saved for this "create" page
            className={`min-w-[130px] ${hasSavedOnce ? "bg-green-600 hover:bg-green-700 cursor-not-allowed" : ""}`}
            title={
              hasSavedOnce ? "Newsletter Saved. Go to edit page to update." : "Save newsletter"
            }
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : hasSavedOnce ? "Saved" : "Save Newsletter"}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => toast.info("Send/Schedule not implemented.")}
                  disabled={!hasSavedOnce || isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  title={!hasSavedOnce ? "Save first" : "Send or schedule"}
                >
                  <Send className="h-4 w-4 mr-1" /> Send/Schedule
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send or Schedule</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* API Error (Keep as is) */}
      {apiError && (
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

      {/* Settings Panel (Keep as is) */}
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
              <label htmlFor="emailSubject" className="text-sm font-medium">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Your catchy email subject"
                required
              />
            </div>
            <div>
              <label htmlFor="emailPreviewText" className="text-sm font-medium">
                Preview Text
              </label>
              <Input
                id="emailPreviewText"
                value={emailPreviewText}
                onChange={(e) => setEmailPreviewText(e.target.value)}
                placeholder="Brief preview shown after subject"
              />
            </div>
            <div>
              <label htmlFor="newsletterStatus" className="text-sm font-medium">
                Status
              </label>
              <Select value={newsletterStatus} onValueChange={setNewsletterStatus}>
                <SelectTrigger id="newsletterStatus" className="h-9">
                  {" "}
                  {/* Consistent height */}
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-0 overflow-hidden">
        {/* Sidebar (Personalization check updated) */}
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
                    onClick={() => addElement(type)} // Consider adding to a default position or a highlighted drop zone
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
                            selectedElementData?.type === "passage") // <-- Include passage
                        ) {
                          addPersonalizationToElement(selectedElementId, field.id);
                        } else {
                          toast.error("Select a Text, Heading, or Passage element first");
                        }
                      }}
                      disabled={
                        !selectedElementId ||
                        (selectedElementData?.type !== "text" &&
                          selectedElementData?.type !== "heading" &&
                          selectedElementData?.type !== "passage") // <-- Include passage
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
                  <p className="text-sm">Click on an element to edit its properties.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </aside>

        {/* Canvas (DnD handlers updated) */}
        <main
          className="bg-white p-6 overflow-y-auto flex justify-center items-start"
          onDragOver={handleCanvasDragOver} // Allow dropping elements from sidebar onto canvas
          onDrop={handleCanvasDrop} // Handle drop from sidebar onto canvas
        >
          <div
            ref={builderRef}
            className={`newsletter-canvas transition-all duration-300 bg-gray-50 shadow-inner border border-dashed border-gray-300 rounded-lg w-full min-h-[600px] relative ${
              viewMode === "desktop" ? "max-w-3xl" : viewMode === "tablet" ? "max-w-xl" : "max-w-sm"
            }`}
            style={{ padding: "20px" }}
            // These handlers on the direct parent are for items from sidebar
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
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
                {" "}
                {/* Outer container for elements, consider if this needs onDragOver/onDrop too for empty space */}
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    id={`element-${element.id}`}
                    className={`element-wrapper relative group transition-all duration-150 ${
                      selectedElementId === element.id
                        ? "outline-none ring-2 ring-primary ring-offset-2 rounded-sm"
                        : "hover:bg-primary/5"
                    } ${draggingElementId === element.id ? "opacity-30 dragging-active" : ""}`} // opacity-30 was opacity-50 in dragstart
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(element.id);
                      setActiveTab("properties");
                    }}
                    draggable // Make the element itself draggable
                    onDragStart={(e) => handleElementDragStart(e, element.id)}
                    onDragEnd={handleElementDragEnd}
                    onDragOver={(e) => handleElementDragOver(e, index)} // Handle dragging over an existing element
                    onDragLeave={handleElementDragLeave} // Handle mouse leaving an element
                    onDrop={(e) => handleElementDrop(e, index)} // Handle dropping an element onto another
                    style={{
                      padding: "4px",
                      minHeight: "30px",
                      position: "relative" /* for indicators */,
                    }}
                  >
                    {/* Toolbar for duplicate/remove */}
                    <div
                      className={`absolute top-1 right-1 hidden group-hover:flex group-focus-within:flex ${selectedElementId === element.id ? "!flex" : ""} items-center bg-white shadow-md border rounded p-0.5 z-10 space-x-0.5`}
                      onClick={(e) => e.stopPropagation()} // Prevent selecting element when clicking toolbar
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
                    {/* Drag Handle */}
                    <div
                      className={`absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full hidden group-hover:flex group-focus-within:flex ${selectedElementId === element.id ? "!flex" : ""} items-center bg-white shadow-md border rounded-full p-0.5 z-10 cursor-move`}
                      title="Drag to reorder"
                      onClick={(e) => e.stopPropagation()} // Prevent selecting element
                      // The parent div is draggable, this is just a visual cue
                    >
                      <Menu className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <RenderNewsletterElement element={element} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Styles (Keep as is, or refine drop indicator animation) */}
      <style jsx global>{`
        .element-wrapper.drop-indicator-top::before {
          content: "";
          display: block;
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #3b82f6; /* blue-500 */
          border-radius: 2px;
          z-index: 20; /* Higher z-index */
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
          background-color: #3b82f6; /* blue-500 */
          border-radius: 2px;
          z-index: 20; /* Higher z-index */
          animation: pulse-indicator 1.2s infinite ease-in-out;
        }
        @keyframes pulse-indicator {
          0%,
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.5;
            transform: scaleY(0.7);
          }
        }
        .dragging-active {
          /* Class for the element being dragged */
          /* opacity: 0.3; /* Already set in handleElementDragStart */
          /* box-shadow: 0 0 15px rgba(0,0,0,0.2); */ /* Optional: visual cue for dragged item */
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
        }
      `}</style>
    </div>
  );
}

// --- PropertiesPanel Component (Passage type added) ---
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

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b">
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
                  <Copy className="h-4 w-4" />
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
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content Properties */}
      {(element.type === "text" || element.type === "heading" || element.type === "passage") && ( // <-- Include passage
        <div className="space-y-1">
          <label className="text-xs font-medium">Text Content</label>
          <Textarea
            value={element.content || ""}
            onChange={(e) => handlePropChange("content", e.target.value)}
            rows={element.type === "heading" ? 2 : element.type === "passage" ? 6 : 4} // <-- Passage rows
          />
        </div>
      )}
      {/* ... (other element type properties as before) ... */}
      {element.type === "button" && (
        <>
          <div className="space-y-1">
            <label className="text-xs font-medium">Button Text</label>
            <Input
              value={element.content || ""}
              onChange={(e) => handlePropChange("content", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Link URL</label>
            <Input
              type="url"
              value={element.url || ""}
              placeholder="https://example.com"
              onChange={(e) => handlePropChange("url", e.target.value)}
            />
          </div>
        </>
      )}
      {element.type === "image" && (
        <div className="space-y-1">
          <label className="text-xs font-medium">Image URL</label>
          <Input
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
          <div className="space-y-1 mt-2">
            <label className="text-xs font-medium">Alt Text</label>
            <Input
              value={element.alt || ""}
              placeholder="Describe image"
              onChange={(e) => handlePropChange("alt", e.target.value)}
            />
          </div>
        </div>
      )}
      {element.type === "social" && (
        <div className="space-y-3">
          <label className="text-xs font-medium block">Social Links</label>
          {(element.socialLinks || []).map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm capitalize w-16 shrink-0">{link.platform}:</span>
              <Input
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
        </div>
      )}
      {element.type === "code" && (
        <div className="space-y-1">
          <label className="text-xs font-medium">Custom HTML</label>
          <Textarea
            value={element.content || ""}
            onChange={(e) => handlePropChange("content", e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
          <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
            Warning: Test thoroughly. Invalid HTML can break rendering.
          </p>
        </div>
      )}

      {/* Styling Properties */}
      <div className="space-y-3 border-t pt-4 mt-4">
        <label className="text-xs font-semibold block">Styling</label>
        {(element.type === "text" || element.type === "heading" || element.type === "passage") && ( // <-- Include passage
          <div className="grid grid-cols-2 gap-3">
            <PropertyInput
              label="Font Size"
              value={(element.style?.fontSize as string) || ""}
              onChange={(v) => handleStyleChange("fontSize", v)}
              placeholder="16px"
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
            />
            <PropertySelect
              label="Font Weight"
              value={(element.style?.fontWeight as string) || "normal"}
              onChange={(v) => handleStyleChange("fontWeight", v)}
              options={[
                { value: "normal", label: "Normal" },
                { value: "bold", label: "Bold" },
              ]}
            />
            <PropertyColorInput
              label="Text Color"
              value={element.style?.color || "#333333"}
              onChange={(v) => handleStyleChange("color", v)}
            />
            {/* Added Line Height for text, heading, passage */}
            <PropertyInput
              label="Line Height"
              value={
                (element.style?.lineHeight as string) ||
                (element.type === "passage" ? "1.6" : "normal")
              }
              onChange={(v) => handleStyleChange("lineHeight", v)}
              placeholder="normal or 1.6"
            />
          </div>
        )}
        {/* ... (other element type styling as before) ... */}
        {element.type === "button" && (
          <div className="grid grid-cols-2 gap-3">
            <PropertyColorInput
              label="Background"
              value={element.style?.backgroundColor || "#3b82f6"}
              onChange={(v) => handleStyleChange("backgroundColor", v)}
            />
            <PropertyColorInput
              label="Text Color"
              value={element.style?.color || "#ffffff"}
              onChange={(v) => handleStyleChange("color", v)}
            />
            <PropertySelect
              label="Font Weight"
              value={(element.style?.fontWeight as string) || "normal"}
              onChange={(v) => handleStyleChange("fontWeight", v)}
              options={[
                { value: "normal", label: "Normal" },
                { value: "bold", label: "Bold" },
              ]}
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
            />
            <PropertyInput
              label="Padding"
              value={(element.style?.padding as string) || "10px 20px"}
              onChange={(v) => handleStyleChange("padding", v)}
              placeholder="10px 20px"
            />
            <PropertyInput
              label="Border Radius"
              value={(element.style?.borderRadius as string) || "4px"}
              onChange={(v) => handleStyleChange("borderRadius", v)}
              placeholder="4px"
            />
          </div>
        )}
        {element.type === "image" && (
          <div className="grid grid-cols-2 gap-3">
            <PropertySelect
              label="Width"
              value={(element.style?.width as string) || "100%"}
              onChange={(v) => handleStyleChange("width", v)}
              options={["25%", "50%", "75%", "100%", "auto"].map((o) => ({ value: o, label: o }))}
            />
            <PropertySelect
              label="Alignment" // This is effectively margin-based alignment for block images
              value={
                (element.style?.margin as string)?.includes("auto")
                  ? "auto"
                  : (element.style?.margin as string)?.endsWith("auto")
                    ? "left-auto"
                    : "default"
              }
              onChange={(v) => {
                if (v === "auto")
                  handleStyleChange("margin", "0 auto"); // Center
                else if (v === "left-auto")
                  handleStyleChange("margin", "0 0 0 auto"); // Right
                else handleStyleChange("margin", "0"); // Left (default block behavior)
              }}
              options={[
                { value: "default", label: "Left" }, // Default for block elements
                { value: "auto", label: "Center" },
                { value: "left-auto", label: "Right" },
              ]}
            />
          </div>
        )}
        {element.type === "divider" && (
          <div className="grid grid-cols-2 gap-3">
            <PropertySelect
              label="Style"
              value={(element.style?.borderTopStyle as string) || "solid"}
              onChange={(v) => handleStyleChange("borderTopStyle", v)}
              options={[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
                { value: "dotted", label: "Dotted" },
              ]}
            />
            <PropertyInput
              label="Thickness"
              value={(element.style?.borderTopWidth as string) || "1px"}
              onChange={(v) => handleStyleChange("borderTopWidth", v)}
              placeholder="1px"
            />
            <PropertyColorInput
              label="Color"
              value={(element.style?.borderTopColor as string) || "#e5e7eb"}
              onChange={(v) => handleStyleChange("borderTopColor", v)}
            />
            <PropertyInput
              label="Vertical Space" // Margin (top/bottom)
              value={(element.style?.margin as string) || "20px 0"}
              onChange={(v) => handleStyleChange("margin", v)}
              placeholder="20px 0"
            />
          </div>
        )}
        {element.type === "spacer" && (
          <PropertyInput
            label="Height"
            value={(element.style?.height as string) || element.height || "40px"}
            onChange={(v) => {
              handleStyleChange("height", v);
              handlePropChange("height", v); // Keep prop for non-style access if needed
            }}
            placeholder="40px"
          />
        )}
      </div>
    </div>
  );
}

// Helper components for PropertiesPanel (PropertySelect updated)
const PropertyInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium">{label}</label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="text-sm h-9"
    />
  </div>
);
const PropertyColorInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium">{label}</label>
    <Input
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-sm w-full h-9">
        {" "}
        {/* <-- MODIFIED for immersiveness */}
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
  </div>
);

// --- RenderNewsletterElement Component (Passage type added) ---
interface RenderNewsletterElementProps {
  element: NewsletterElement;
  viewMode: ViewMode;
}

function RenderNewsletterElement({ element, viewMode }: RenderNewsletterElementProps) {
  const commonStyles: React.CSSProperties = {
    // Default margin/padding to 0 if not specified, to avoid unexpected browser defaults
    margin: element.style?.margin ?? "0",
    padding: element.style?.padding ?? "0",
    wordBreak: "break-word", // Good default for text elements
    ...element.style, // Element specific styles override defaults
  };

  // Apply viewMode specific styles if any (this is a placeholder for more complex logic)
  // if (viewMode === "mobile" && element.style?.mobile) {
  //   Object.assign(commonStyles, element.style.mobile);
  // } else if (viewMode === "tablet" && element.style?.tablet) {
  //   Object.assign(commonStyles, element.style.tablet);
  // }

  switch (element.type) {
    case "heading":
      return <h2 style={commonStyles}>{element.content || "Empty Heading"}</h2>;
    case "text":
      return <p style={commonStyles}>{element.content || "Empty Text Block"}</p>;
    case "passage": // <-- ADDED PASSAGE
      // For passages, you might want to ensure whitespace is preserved for multiple paragraphs
      return (
        <div
          style={{ whiteSpace: "pre-wrap", ...commonStyles }}
          dangerouslySetInnerHTML={{
            __html:
              (element.content || "Empty Passage").replace(/\n/g, "<br />") || "Empty Passage",
          }}
        />
      );
    case "image":
      return (
        <img
          src={element.src || "https://placehold.co/100x50?text=No+Image"}
          alt={element.alt || "Newsletter image"}
          style={{
            display: "block", // Makes margin auto work for centering
            maxWidth: "100%", // Responsive
            height: "auto", // Maintain aspect ratio
            ...commonStyles,
            // Ensure width from style is applied, default to 100% if not set and it's an image
            width: commonStyles.width || "100%",
          }}
        />
      );
    case "button":
      // Buttons are tricky in email, often requiring table-based layouts for max compatibility
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
                  padding: "5px 0" /* Outer padding for alignment cell */,
                }}
              >
                <a
                  href={element.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block", // Crucial for padding and background to work right
                    textDecoration: "none",
                    // Apply all common styles, but ensure specific button defaults are there
                    backgroundColor: commonStyles.backgroundColor || "#3b82f6",
                    color: commonStyles.color || "#ffffff",
                    padding: commonStyles.padding || "10px 20px",
                    borderRadius: commonStyles.borderRadius || "4px",
                    fontWeight: commonStyles.fontWeight || "normal",
                    // Remove margin from commonStyles for the <a>, apply to wrapping <td> or outer table
                    ...{ ...commonStyles, margin: undefined },
                  }}
                  onClick={(e) => e.preventDefault()} // Prevent navigation in builder
                >
                  {element.content || "Button"}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      );
    case "divider":
      // Use a div with border-top for more styling control than <hr>
      return (
        <div
          style={{
            height: "0px", // or 1px if border is inside
            borderTopStyle: element.style?.borderTopStyle || "solid",
            borderTopWidth: (element.style?.borderTopWidth as string) || "1px",
            borderTopColor: (element.style?.borderTopColor as string) || "#e5e7eb",
            ...{ ...commonStyles, borderTop: undefined, margin: undefined }, // remove these if they conflict
          }}
        ></div>
      );
    case "spacer":
      return (
        <div
          style={{
            ...commonStyles, // Includes margin if set
            height: element.style?.height || element.height || "20px",
            fontSize: "1px", // Outlook hack for spacer
            lineHeight: "1px", // Outlook hack for spacer
          }}
        >
            {/* Non-breaking space to ensure div isn't collapsed by some clients */}
        </div>
      );
    case "social":
      if (!element.socialLinks || element.socialLinks.length === 0) {
        return (
          <p
            style={{
              ...commonStyles,
              textAlign: (commonStyles.textAlign as any) || "center",
              fontStyle: "italic",
              color: "#999",
            }}
          >
            No social links.
          </p>
        );
      }
      return (
        <table
          border={0}
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          style={{ ...commonStyles, margin: commonStyles.margin || "20px 0" }}
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
                  {" "}
                  {/* Wrapper for multiple icons if inline */}
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
                              <img // Replace with actual icons or more sophisticated placeholders
                                src={`https://img.shields.io/badge/-${link.platform}-grey?logo=${link.platform}&style=social&label=`}
                                alt={link.platform}
                                width="32" // Adjust size as needed
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
          className="custom-html-preview border border-dashed border-amber-400 bg-amber-50 p-1 my-1 overflow-hidden"
          title="Custom HTML Preview (styling may differ in email client)"
          dangerouslySetInnerHTML={{
            __html: element.content || "<p class='text-xs text-gray-500'>[Empty HTML Block]</p>",
          }}
          style={commonStyles} // Apply user styles to the wrapper
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
                  width={`${100 / (element.columns?.length || 1)}%`} // Basic equal width
                  valign="top" // Align content to top
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
                    // Vertical padding can be added here or within column elements
                  }}
                >
                  {/* This div acts as the inner container for column elements */}
                  <div className="column-cell-inner">
                    {columnContent.map((colElement) => (
                      // Each element in a column needs a wrapper for consistent spacing, e.g., margin-bottom
                      <div
                        key={colElement.id}
                        style={{ marginBottom: "10px" /* Or configurable */ }}
                      >
                        <RenderNewsletterElement element={colElement} viewMode={viewMode} />
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
        <div className="text-xs text-red-500 p-2 border border-red-500 bg-red-50">
          Unknown element type: {(element as any).type}
        </div>
      );
  }
}

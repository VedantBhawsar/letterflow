import { useState, useCallback, useEffect } from "react";
import { useNewsletter } from "../contexts/NewsletterContext";
import type { Newsletter, NewsletterUpdateInput } from "../contexts/NewsletterContext";

export interface EditorBlock {
  id: string;
  type: "text" | "image" | "button" | "divider" | "spacer";
  content: string;
  settings?: {
    alignment?: "left" | "center" | "right";
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    padding?: number;
    imageUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
    height?: number;
  };
}

export interface NewsletterContent {
  blocks: EditorBlock[];
  subject: string;
  previewText?: string;
}

export interface UseNewsletterEditorResult {
  content: NewsletterContent;
  updateContent: (content: NewsletterContent) => void;
  updateBlock: (blockId: string, blockData: Partial<EditorBlock>) => void;
  addBlock: (blockType: EditorBlock["type"], position?: number) => void;
  removeBlock: (blockId: string) => void;
  moveBlockUp: (blockId: string) => void;
  moveBlockDown: (blockId: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  save: () => Promise<void>;
}

/**
 * Custom hook for managing newsletter editor state and operations
 */
export function useNewsletterEditor(newsletterId: string): UseNewsletterEditorResult {
  // Connect to the global newsletter context
  const { getNewsletter, updateNewsletter, state } = useNewsletter();

  // Local state for the editor
  const [content, setContent] = useState<NewsletterContent>({
    blocks: [],
    subject: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Initialize editor with data from the API
  useEffect(() => {
    getNewsletter(newsletterId);
  }, [newsletterId, getNewsletter]);

  // Update content when newsletter data changes
  useEffect(() => {
    if (state.currentNewsletter) {
      try {
        const parsedContent =
          typeof state.currentNewsletter.content === "string"
            ? JSON.parse(state.currentNewsletter.content)
            : state.currentNewsletter.content;

        setContent({
          blocks: parsedContent.blocks || [],
          subject: parsedContent.subject || state.currentNewsletter.title || "",
          previewText: parsedContent.previewText || "",
        });
      } catch (error) {
        setLocalError("Invalid newsletter content format");
        console.error("Error parsing newsletter content:", error);
      }
    }
  }, [state.currentNewsletter]);

  // Update the entire content state
  const updateContent = useCallback((newContent: NewsletterContent) => {
    setContent(newContent);
  }, []);

  // Update a specific block
  const updateBlock = useCallback((blockId: string, blockData: Partial<EditorBlock>) => {
    setContent((prevContent) => ({
      ...prevContent,
      blocks: prevContent.blocks.map((block) =>
        block.id === blockId ? { ...block, ...blockData } : block
      ),
    }));
  }, []);

  // Add a new block
  const addBlock = useCallback((blockType: EditorBlock["type"], position?: number) => {
    const newBlock: EditorBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      content: blockType === "text" ? "New text block" : "",
      settings: getDefaultSettingsForBlockType(blockType),
    };

    setContent((prevContent) => {
      const newBlocks = [...prevContent.blocks];
      if (position !== undefined && position >= 0 && position <= newBlocks.length) {
        newBlocks.splice(position, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }

      return {
        ...prevContent,
        blocks: newBlocks,
      };
    });
  }, []);

  // Remove a block
  const removeBlock = useCallback((blockId: string) => {
    setContent((prevContent) => ({
      ...prevContent,
      blocks: prevContent.blocks.filter((block) => block.id !== blockId),
    }));
  }, []);

  // Move a block up in the list
  const moveBlockUp = useCallback((blockId: string) => {
    setContent((prevContent) => {
      const blockIndex = prevContent.blocks.findIndex((block) => block.id === blockId);
      if (blockIndex <= 0) return prevContent;

      const newBlocks = [...prevContent.blocks];
      const temp = newBlocks[blockIndex];
      newBlocks[blockIndex] = newBlocks[blockIndex - 1];
      newBlocks[blockIndex - 1] = temp;

      return {
        ...prevContent,
        blocks: newBlocks,
      };
    });
  }, []);

  // Move a block down in the list
  const moveBlockDown = useCallback((blockId: string) => {
    setContent((prevContent) => {
      const blockIndex = prevContent.blocks.findIndex((block) => block.id === blockId);
      if (blockIndex === -1 || blockIndex >= prevContent.blocks.length - 1) {
        return prevContent;
      }

      const newBlocks = [...prevContent.blocks];
      const temp = newBlocks[blockIndex];
      newBlocks[blockIndex] = newBlocks[blockIndex + 1];
      newBlocks[blockIndex + 1] = temp;

      return {
        ...prevContent,
        blocks: newBlocks,
      };
    });
  }, []);

  // Save the current content
  const save = useCallback(async () => {
    setIsSaving(true);
    setLocalError(null);

    try {
      const updateData: NewsletterUpdateInput = {
        title: content.subject,
        content: JSON.stringify(content),
      };

      await updateNewsletter(newsletterId, updateData);
      setIsSaving(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setLocalError(errorMessage);
      setIsSaving(false);
    }
  }, [newsletterId, content, updateNewsletter]);

  return {
    content,
    updateContent,
    updateBlock,
    addBlock,
    removeBlock,
    moveBlockUp,
    moveBlockDown,
    isSaving,
    isLoading: state.status === "loading",
    error: localError || state.error,
    save,
  };
}

// Helper function for default block settings
function getDefaultSettingsForBlockType(blockType: EditorBlock["type"]) {
  switch (blockType) {
    case "text":
      return {
        alignment: "left" as const,
        fontSize: 16,
        color: "#000000",
      };
    case "image":
      return {
        imageUrl: "",
        padding: 10,
      };
    case "button":
      return {
        buttonText: "Click me",
        buttonUrl: "#",
        backgroundColor: "#007bff",
        color: "#ffffff",
        padding: 10,
      };
    case "spacer":
      return {
        height: 20,
      };
    default:
      return {};
  }
}

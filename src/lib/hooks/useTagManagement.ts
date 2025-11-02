import { useState } from "react";

/**
 * Custom hook for managing tags in forms
 * Provides tag input state and helper functions for adding/removing tags
 */
export function useTagManagement(initialTags: string[] = []) {
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialTags);

  /**
   * Adds a new tag if it's not empty and not already in the list
   * @param tag - Optional tag to add (uses tagInput if not provided)
   */
  const addTag = (tag?: string) => {
    const newTag = (tag || tagInput).trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
      return true;
    }
    return false;
  };

  /**
   * Removes a tag from the list
   * @param tagToRemove - The tag to remove
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /**
   * Handles Enter key press to add a tag
   * @param e - Keyboard event
   */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  /**
   * Resets all tags to a new array
   * @param newTags - The new tags array
   */
  const setAllTags = (newTags: string[]) => {
    setTags(newTags);
  };

  return {
    tagInput,
    setTagInput,
    tags,
    setTags: setAllTags,
    addTag,
    removeTag,
    handleTagKeyDown,
  };
}

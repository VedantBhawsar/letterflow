import { useState, useMemo, useCallback, memo } from "react";
import { useNewsletterEditor, type EditorBlock } from "@/lib/hooks/useNewsletterEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Save, Plus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { debounce } from "@/lib/utils";

interface NewsletterEditorProps {
  newsletterId: string;
  onSaveSuccess?: () => void;
}

export function NewsletterEditor({ newsletterId, onSaveSuccess }: NewsletterEditorProps) {
  const {
    content,
    updateContent,
    updateBlock,
    addBlock,
    removeBlock,
    moveBlockUp,
    moveBlockDown,
    isSaving,
    isLoading,
    error,
    save,
  } = useNewsletterEditor(newsletterId);

  const [activeTab, setActiveTab] = useState("content");

  // Handle save with optional callback
  const handleSave = useCallback(async () => {
    await save();
    if (onSaveSuccess) {
      onSaveSuccess();
    }
  }, [save, onSaveSuccess]);

  // Debounced subject update
  const updateSubject = useMemo(
    () =>
      // @ts-expect-error - updateContent is compatible with EditorBlock
      debounce((value: string) => {
        updateContent({
          ...content,
          subject: value,
        });
      }, 300),
    [updateContent, content]
  );

  // Debounced preview text update
  const updatePreviewText = useMemo(
    () =>
      // @ts-expect-error - updateContent is compatible with EditorBlock
      debounce((value: string) => {
        updateContent({
          ...content,
          previewText: value,
        });
      }, 300),
    [updateContent, content]
  );

  if (isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Newsletter Editor</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="space-y-4">
            <AddBlockToolbar onAddBlock={addBlock} />
            <BlocksList
              blocks={content.blocks}
              onUpdateBlock={updateBlock}
              onRemoveBlock={removeBlock}
              onMoveUp={moveBlockUp}
              onMoveDown={moveBlockDown}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">
                Subject Line
              </label>
              <Input
                id="subject"
                defaultValue={content.subject}
                onChange={(e) => updateSubject(e.target.value)}
                placeholder="Newsletter subject line"
                aria-describedby="subject-description"
              />
              <p id="subject-description" className="text-sm text-gray-500 mt-1">
                This will appear as the email subject
              </p>
            </div>

            <div>
              <label htmlFor="preview-text" className="block text-sm font-medium mb-1">
                Preview Text
              </label>
              <Textarea
                id="preview-text"
                defaultValue={content.previewText}
                onChange={(e) => updatePreviewText(e.target.value)}
                placeholder="A brief preview of your newsletter"
                rows={3}
                aria-describedby="preview-description"
              />
              <p id="preview-description" className="text-sm text-gray-500 mt-1">
                This will appear in email clients as a preview
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="min-h-[400px]">
          <NewsletterPreview content={content} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Memoized components for performance optimization

const AddBlockToolbar = memo(function AddBlockToolbar({
  onAddBlock,
}: {
  onAddBlock: (type: EditorBlock["type"]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock("text")}
        aria-label="Add text block"
      >
        <Plus className="h-4 w-4 mr-2" />
        Text
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock("image")}
        aria-label="Add image block"
      >
        <Plus className="h-4 w-4 mr-2" />
        Image
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock("button")}
        aria-label="Add button block"
      >
        <Plus className="h-4 w-4 mr-2" />
        Button
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock("divider")}
        aria-label="Add divider block"
      >
        <Plus className="h-4 w-4 mr-2" />
        Divider
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddBlock("spacer")}
        aria-label="Add spacer block"
      >
        <Plus className="h-4 w-4 mr-2" />
        Spacer
      </Button>
    </div>
  );
});

const BlocksList = memo(function BlocksList({
  blocks,
  onUpdateBlock,
  onRemoveBlock,
  onMoveUp,
  onMoveDown,
}: {
  blocks: EditorBlock[];
  onUpdateBlock: (id: string, data: Partial<EditorBlock>) => void;
  onRemoveBlock: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">Add blocks to start building your newsletter</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block: any, index: any) => (
        <EditorBlockComponent
          key={block.id}
          block={block}
          isFirst={index === 0}
          isLast={index === blocks.length - 1}
          onUpdate={(data) => onUpdateBlock(block.id, data)}
          onRemove={() => onRemoveBlock(block.id)}
          onMoveUp={() => onMoveUp(block.id)}
          onMoveDown={() => onMoveDown(block.id)}
        />
      ))}
    </div>
  );
});

const EditorBlockComponent = memo(function EditorBlockComponent({
  block,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: EditorBlock;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (data: Partial<EditorBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      onUpdate({ content: e.target.value });
    },
    [onUpdate]
  );

  return (
    <div
      className="border rounded-lg relative p-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-2">
        <span className="font-medium capitalize">{block.type} Block</span>
        <div className={`ml-auto flex space-x-1 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move block up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move block down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove block">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {block.type === "text" && (
        <Textarea
          value={block.content}
          onChange={handleContentChange}
          placeholder="Enter text content"
          className="mt-2"
          rows={3}
        />
      )}

      {block.type === "image" && (
        <Input
          type="text"
          value={block.content}
          onChange={handleContentChange}
          placeholder="Enter image URL"
          className="mt-2"
        />
      )}

      {block.type === "button" && (
        <div className="space-y-2 mt-2">
          <Input value={block.content} onChange={handleContentChange} placeholder="Button text" />
          <Input
            value={block.settings?.buttonUrl || ""}
            onChange={(e) =>
              onUpdate({
                settings: { ...block.settings, buttonUrl: e.target.value },
              })
            }
            placeholder="Button URL"
          />
        </div>
      )}

      {block.type === "spacer" && (
        <div className="text-center text-gray-500 py-2">
          Spacer (height: {block.settings?.height || 20}px)
        </div>
      )}

      {block.type === "divider" && <hr className="my-2" />}
    </div>
  );
});

function NewsletterPreview({
  content,
}: {
  content: { blocks: EditorBlock[]; subject: string; previewText?: string };
}) {
  return (
    <div className="border rounded-lg p-6 max-w-2xl mx-auto bg-white">
      <div className="mb-6 border-b pb-4">
        <h2 className="font-bold text-xl mb-2">{content.subject || "No subject"}</h2>
        {content.previewText && <p className="text-gray-500">{content.previewText}</p>}
      </div>

      <div className="space-y-4">
        {content.blocks.map((block: any) => (
          <PreviewBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}

const PreviewBlock = memo(function PreviewBlock({ block }: { block: EditorBlock }) {
  const style = useMemo(() => {
    return {
      textAlign: block.settings?.alignment || "left",
      fontSize: block.settings?.fontSize ? `${block.settings.fontSize}px` : "inherit",
      color: block.settings?.color || "inherit",
      backgroundColor: block.settings?.backgroundColor || "transparent",
      padding: block.settings?.padding ? `${block.settings.padding}px` : "0",
      height: block.settings?.height ? `${block.settings.height}px` : "auto",
    } as React.CSSProperties;
  }, [block]);

  switch (block.type) {
    case "text":
      return <p style={style}>{block.content}</p>;
    case "image":
      return block.content ? (
        <img
          src={block.content}
          alt="Newsletter image"
          style={style}
          className="max-w-full h-auto"
        />
      ) : (
        <div className="bg-gray-200 text-center py-8">Image placeholder</div>
      );
    case "button":
      return (
        <div style={{ textAlign: style.textAlign }}>
          <a
            href={block.settings?.buttonUrl || "#"}
            className="inline-block px-6 py-2 rounded"
            style={{
              backgroundColor: block.settings?.backgroundColor || "#007bff",
              color: block.settings?.color || "#ffffff",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {block.content || "Button"}
          </a>
        </div>
      );
    case "divider":
      return <hr className="border-t my-4" />;
    case "spacer":
      return <div style={{ height: style.height }} aria-hidden="true" />;
    default:
      return null;
  }
});

function EditorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-40 bg-gray-200 rounded"></div>
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-full bg-gray-200 rounded"></div>
      <div className="space-y-4">
        <div className="h-40 w-full bg-gray-200 rounded"></div>
        <div className="h-40 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

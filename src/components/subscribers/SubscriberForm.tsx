import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const subscriberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(["active", "unsubscribed", "bounced"]),
  tags: z.array(z.string()),
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

type SubscriberFormProps = {
  subscriber?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: "active" | "unsubscribed" | "bounced";
    tags: string[];
  };
  onSubmit: (values: SubscriberFormValues) => Promise<void>;
  onCancel: () => void;
};

export function SubscriberForm({ subscriber, onSubmit, onCancel }: SubscriberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const defaultValues: SubscriberFormValues = {
    email: subscriber?.email || "",
    firstName: subscriber?.firstName || "",
    lastName: subscriber?.lastName || "",
    status: subscriber?.status || "active",
    tags: subscriber?.tags || [],
  };

  const form = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues,
  });

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const currentTags = form.getValues("tags");
      const newTag = tagInput.trim();

      if (!currentTags.includes(newTag)) {
        form.setValue("tags", [...currentTags, newTag]);
        setTagInput("");
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags");
      const newTag = tagInput.trim();

      if (!currentTags.includes(newTag)) {
        form.setValue("tags", [...currentTags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleSubmit = async (values: SubscriberFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="email@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="First name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Last name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.watch("tags").map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag} tag</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag"
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner size="sm" className="mr-2" />}
            {subscriber ? "Update" : "Create"} Subscriber
          </Button>
        </div>
      </form>
    </Form>
  );
}

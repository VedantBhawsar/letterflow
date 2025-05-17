"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campaign } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, PlusCircle } from "lucide-react";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject line is required"),
  content: z.string().min(1, "Email content is required"),
  status: z.enum(["draft", "scheduled"]),
  scheduledDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

interface CreateCampaignFormProps {
  onSuccess?: (campaign: Campaign) => void;
  onCancel?: () => void;
}

export function CreateCampaignForm({ onSuccess, onCancel }: CreateCampaignFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "", // Consider if this should be a more complex editor later
      status: "draft",
      scheduledDate: null,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);

      const payload = {
        ...values,
        // Ensure scheduledDate is correctly formatted or null if not applicable
        scheduledDate:
          values.status === "scheduled" && values.scheduledDate
            ? new Date(values.scheduledDate).toISOString()
            : null,
      };

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || "Failed to create campaign");
      }

      const campaign: Campaign = await response.json();
      toast.success("Campaign created successfully!");

      form.reset();
      if (onSuccess) onSuccess(campaign);
      router.refresh(); // Refresh data on the page showing campaigns list
    } catch (error: unknown) {
      console.error("Error creating campaign:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  // DS Classes
  const dsInputClass =
    "h-10 bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-md";
  const dsTextareaClass = `${dsInputClass} min-h-[150px] sm:min-h-[200px] py-2`; // Adjusted min-h
  const dsLabelClass = "text-sm font-medium text-slate-300";
  const dsDescriptionClass = "text-xs text-slate-500 pt-1";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={dsLabelClass}>Campaign Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Monthly Product Updates - November"
                  {...field}
                  className={dsInputClass}
                />
              </FormControl>
              <FormDescription className={dsDescriptionClass}>
                An internal name for this campaign (not shown to recipients).
              </FormDescription>
              <FormMessage className="text-red-400 text-xs pt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={dsLabelClass}>Subject Line</FormLabel>
              <FormControl>
                <Input
                  placeholder="✨ Your November News & Exciting Offers!"
                  {...field}
                  className={dsInputClass}
                />
              </FormControl>
              <FormDescription className={dsDescriptionClass}>
                The subject line recipients will see. Make it engaging!
              </FormDescription>
              <FormMessage className="text-red-400 text-xs pt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={dsLabelClass}>Email Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Craft your email message here... You can use Markdown or HTML depending on your setup."
                  className={dsTextareaClass}
                  {...field}
                />
              </FormControl>
              <FormDescription className={dsDescriptionClass}>
                The main body of your email. (Rich text editor can be integrated here).
              </FormDescription>
              <FormMessage className="text-red-400 text-xs pt-1" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={dsLabelClass}>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={dsInputClass}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-300 rounded-md shadow-xl">
                    <SelectItem
                      value="draft"
                      className="hover:bg-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white data-[highlighted]:bg-slate-700"
                    >
                      Draft
                    </SelectItem>
                    <SelectItem
                      value="scheduled"
                      className="hover:bg-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white data-[highlighted]:bg-slate-700"
                    >
                      Scheduled
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className={dsDescriptionClass}>
                  'Draft' to save and edit later, or 'Scheduled' for a future send.
                </FormDescription>
                <FormMessage className="text-red-400 text-xs pt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={dsLabelClass}>Schedule Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local" // Using datetime-local for date and time
                    {...field}
                    // Ensure value is correctly formatted for datetime-local input if it's a Date object
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                    disabled={form.watch("status") !== "scheduled"}
                    className={`${dsInputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </FormControl>
                <FormDescription className={dsDescriptionClass}>
                  Only active if status is 'Scheduled'. Pick a future date/time.
                </FormDescription>
                <FormMessage className="text-red-400 text-xs pt-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button
            type="button"
            variant="outline"
            onClick={
              onCancel ||
              (() => {
                form.reset();
                router.back();
              })
            } // Enhanced onCancel
            className="border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-slate-100 h-10 px-4 rounded-md"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-md flex items-center justify-center gap-2 disabled:bg-emerald-700/60 disabled:cursor-not-allowed min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Campaign
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

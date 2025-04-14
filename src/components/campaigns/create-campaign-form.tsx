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

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject line is required"),
  content: z.string().min(1, "Email content is required"),
  status: z.enum(["draft", "scheduled"]),
  scheduledDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignForm({
  onSuccess,
}: {
  onSuccess?: (campaign: Campaign) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      status: "draft",
      scheduledDate: null,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create campaign");
      }

      const campaign = await response.json();
      toast.success("Campaign created successfully");

      // Reset the form
      form.reset();

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(campaign);
      }

      // Refresh the campaigns list
      router.refresh();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="Monthly Newsletter" {...field} />
              </FormControl>
              <FormDescription>
                Give your campaign a descriptive name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Line</FormLabel>
              <FormControl>
                <Input placeholder="Your November Updates" {...field} />
              </FormControl>
              <FormDescription>
                The subject line recipients will see in their inbox
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your email content here..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>The content of your email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set as draft to edit later or scheduled to choose a sending date
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  disabled={form.watch("status") !== "scheduled"}
                />
              </FormControl>
              <FormDescription>
                Choose when to send your campaign (only for scheduled campaigns)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

"use client"; // Ensure this directive is needed based on your project setup

import { useState } from "react";
// Import specific RHF types
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus, X, Grip, Settings, Paintbrush, Eye, Code, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formSchema, FormValues, FIELD_TYPES } from "@/lib/schemas/form-schema";

// Re-export FormValues for backward compatibility
export type { FormValues };

// --- Component Props ---
type FormBuilderProps = {
  initialValues?: Partial<FormValues>; // Allow providing partial initial data
  onSubmit: (values: FormValues) => Promise<void>; // Function to handle form submission
  onPreview: (values: FormValues) => void; // Function to trigger preview
  onGenerateCode: (values: FormValues) => void; // Function to trigger code generation
};

// --- Form Builder Component ---
export function FormBuilder({
  initialValues,
  onSubmit,
  onPreview,
  onGenerateCode,
}: FormBuilderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("fields"); // Default active tab

  // Merge initial values with defaults, ensuring all fields are present
  const defaultValues: FormValues = {
    name: initialValues?.name ?? "My Subscription Form",
    description: initialValues?.description ?? "", // Default empty description
    fields:
      initialValues?.fields && initialValues.fields.length > 0
        ? initialValues.fields
        : [
            // Default with at least one field (email)
            {
              id: "email-" + Date.now(),
              type: "email",
              label: "Email Address",
              placeholder: "your@email.com",
              required: true,
              options: [],
            },
          ],
    settings: {
      submitButtonText:
        initialValues?.settings?.submitButtonText ??
        formSchema.shape.settings.shape.submitButtonText.parse(undefined),
      successMessage:
        initialValues?.settings?.successMessage ??
        formSchema.shape.settings.shape.successMessage.parse(undefined),
      doubleOptIn: initialValues?.settings?.doubleOptIn ?? false,
      redirectUrl: initialValues?.settings?.redirectUrl ?? "",
      honeypotEnabled: initialValues?.settings?.honeypotEnabled ?? true,
      recaptchaEnabled: initialValues?.settings?.recaptchaEnabled ?? false,
      recaptchaSiteKey: initialValues?.settings?.recaptchaSiteKey ?? "",
    },
    style: {
      primaryColor:
        initialValues?.style?.primaryColor ??
        formSchema.shape.style.shape.primaryColor.parse(undefined),
      backgroundColor:
        initialValues?.style?.backgroundColor ??
        formSchema.shape.style.shape.backgroundColor.parse(undefined),
      textColor:
        initialValues?.style?.textColor ?? formSchema.shape.style.shape.textColor.parse(undefined),
      fontFamily: initialValues?.style?.fontFamily ?? "Inter, sans-serif",
      borderRadius: initialValues?.style?.borderRadius ?? "4",
      buttonStyle: initialValues?.style?.buttonStyle ?? "filled",
    },
  };

  // Initialize React Hook Form, typed explicitly
  // @ts-expect-error - useForm is compatible with zod
  const form: UseFormReturn<FormValues> = useForm<FormValues>({
    // @ts-expect-error - useForm is compatible with zod
    resolver: zodResolver(formSchema), // Use Zod schema for validation
    defaultValues, // Provide defaults
    mode: "onChange", // Validate fields as they change
  });

  // Watch the 'fields' array for dynamic rendering
  const fields = form.watch("fields");

  // --- Event Handlers ---

  // Typed submit handler function passed to RHF's handleSubmit
  const handleFormSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    try {
      console.log("Form Submitted Values:", values); // Log values before submitting
      await onSubmit(values);
      // Optionally: show success toast, reset form, etc. handled by parent or here
    } catch (error) {
      console.error("Error submitting form:", error);
      // Optionally: show error toast to user
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new field to the form
  const addField = () => {
    // Define the new field using the schema's array item type
    const newField: FormValues["fields"][number] = {
      id: `field-${Date.now()}`, // Simple unique ID generation
      type: "text",
      label: "New Field",
      placeholder: "",
      required: false,
      options: [], // Initialize options array
    };
    // Get current fields, ensure it's an array, then append
    const currentFields = Array.isArray(fields) ? fields : [];
    form.setValue("fields", [...currentFields, newField], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Remove a field by its ID
  const removeField = (idToRemove: string) => {
    const currentFields = Array.isArray(fields) ? fields : [];
    form.setValue(
      "fields",
      currentFields.filter((field: any) => field.id !== idToRemove),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  // Handle the end of a drag-and-drop operation for fields
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // Dropped outside a droppable area

    const currentFields = Array.isArray(fields) ? fields : [];
    if (source.index === destination.index) return; // Item dropped in the same place

    const items = Array.from(currentFields);
    const [reorderedItem] = items.splice(source.index, 1); // Remove item from original position
    items.splice(destination.index, 0, reorderedItem); // Insert item at new position

    form.setValue("fields", items, { shouldDirty: true }); // Update form state, mark as dirty
  };

  // --- Render JSX ---
  return (
    <div className="space-y-6">
      <Form {...form}>
        {" "}
        {/* Spread RHF context */}
        {/* Pass correctly typed handler to RHF's handleSubmit */}
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* --- Top Header: Name, Description, Actions --- */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between border-b pb-4">
            {/* Left: Name & Description */}
            <div className="flex-grow">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel className="sr-only">Form Name</FormLabel>{" "}
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Form Name"
                        className="text-xl font-semibold border-none focus-visible:ring-0 px-0 h-auto"
                      />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-1">
                    {" "}
                    <FormLabel className="sr-only">Description</FormLabel>{" "}
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter a short description (optional)"
                        className="text-sm text-muted-foreground border-none focus-visible:ring-0 px-0 h-auto"
                      />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
            </div>
            {/* Right: Action Buttons */}
            <div className="flex gap-2 flex-shrink-0 self-start md:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPreview(form.getValues())}
              >
                {" "}
                <Eye className="h-4 w-4 mr-1" /> Preview{" "}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onGenerateCode(form.getValues())}
              >
                {" "}
                <Code className="h-4 w-4 mr-1" /> Code{" "}
              </Button>
              <Button type="submit" disabled={isSubmitting} size="sm">
                {" "}
                {isSubmitting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}{" "}
                {isSubmitting ? "Saving..." : "Save Form"}{" "}
              </Button>
            </div>
          </div>

          {/* --- Main Content: Tabs (Fields, Settings, Design) --- */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fields">
                {" "}
                <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Fields{" "}
              </TabsTrigger>
              <TabsTrigger value="settings">
                {" "}
                <Settings className="h-4 w-4 mr-1 sm:mr-2" /> Settings{" "}
              </TabsTrigger>
              <TabsTrigger value="style">
                {" "}
                <Paintbrush className="h-4 w-4 mr-1 sm:mr-2" /> Design{" "}
              </TabsTrigger>
            </TabsList>

            {/* --- Fields Tab Content --- */}
            <TabsContent value="fields" className="mt-6 space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Form Fields Builder</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="fields">
                      {(
                        providedDrop: DroppableProvided // Use unique name
                      ) => (
                        <div
                          {...providedDrop.droppableProps}
                          ref={providedDrop.innerRef}
                          className="space-y-4"
                        >
                          {/* Map over fields safely */}
                          {Array.isArray(fields) && fields.length > 0 ? (
                            fields.map((fieldItem: any, index: any) => (
                              <Draggable
                                key={fieldItem.id}
                                draggableId={fieldItem.id}
                                index={index}
                              >
                                {(
                                  providedDrag: DraggableProvided // Use unique name
                                ) => (
                                  <div
                                    ref={providedDrag.innerRef}
                                    {...providedDrag.draggableProps}
                                    className="rounded-md border bg-background p-4"
                                  >
                                    {/* Field Item Header */}
                                    <div className="flex items-center justify-between mb-3 border-b pb-2 -mx-4 px-4">
                                      <div
                                        {...providedDrag.dragHandleProps}
                                        className="cursor-grab text-muted-foreground hover:text-foreground p-1"
                                        aria-label="Drag to reorder field"
                                      >
                                        <Grip className="h-5 w-5" />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeField(fieldItem.id)}
                                        className="text-destructive hover:bg-destructive/10 h-7 w-7"
                                        aria-label="Remove field"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    {/* Field Configuration */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Field Type Select */}
                                      <FormField
                                        control={form.control}
                                        name={`fields.${index}.type`}
                                        render={({ field }) => (
                                          <FormItem>
                                            {" "}
                                            <FormLabel>Type</FormLabel>{" "}
                                            <Select
                                              value={field.value}
                                              onValueChange={field.onChange}
                                            >
                                              {" "}
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                              </FormControl>{" "}
                                              <SelectContent>
                                                {FIELD_TYPES.map((typeOpt: any) => (
                                                  <SelectItem
                                                    key={typeOpt.value}
                                                    value={typeOpt.value}
                                                  >
                                                    {typeOpt.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>{" "}
                                            </Select>{" "}
                                            <FormMessage />{" "}
                                          </FormItem>
                                        )}
                                      />
                                      {/* Field Label Input */}
                                      <FormField
                                        control={form.control}
                                        name={`fields.${index}.label`}
                                        render={({ field }) => (
                                          <FormItem>
                                            {" "}
                                            <FormLabel>Label</FormLabel>{" "}
                                            <FormControl>
                                              <Input {...field} placeholder="Enter field label" />
                                            </FormControl>{" "}
                                            <FormMessage />{" "}
                                          </FormItem>
                                        )}
                                      />
                                      {/* Placeholder Input (Conditional) */}
                                      {fieldItem.type !== "checkbox" && (
                                        <FormField
                                          control={form.control}
                                          name={`fields.${index}.placeholder`}
                                          render={({ field }) => (
                                            <FormItem>
                                              {" "}
                                              <FormLabel>Placeholder</FormLabel>{" "}
                                              <FormControl>
                                                <Input
                                                  {...field}
                                                  placeholder="Optional placeholder"
                                                />
                                              </FormControl>{" "}
                                              <FormMessage />{" "}
                                            </FormItem>
                                          )}
                                        />
                                      )}
                                      {/* Required Switch */}
                                      <FormField
                                        control={form.control}
                                        name={`fields.${index}.required`}
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:col-span-2">
                                            {" "}
                                            <div className="space-y-0.5 pr-4">
                                              {" "}
                                              <FormLabel>Required Field</FormLabel>{" "}
                                              <FormDescription className="text-xs">
                                                Is this field mandatory?
                                              </FormDescription>{" "}
                                            </div>{" "}
                                            <FormControl>
                                              <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                aria-labelledby={`required-label-${fieldItem.id}`}
                                              />
                                            </FormControl>{" "}
                                          </FormItem>
                                        )}
                                      />
                                      {/* Options Textarea (Conditional) */}
                                      {fieldItem.type === "select" && (
                                        <FormField
                                          control={form.control}
                                          name={`fields.${index}.options`}
                                          render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                              {" "}
                                              <FormLabel>Options (one per line)</FormLabel>{" "}
                                              <FormControl>
                                                <Textarea
                                                  value={(field.value ?? []).join("\n")}
                                                  onChange={(e) =>
                                                    field.onChange(
                                                      e.target.value
                                                        .split("\n")
                                                        .map((opt) => opt.trim())
                                                        .filter(Boolean)
                                                    )
                                                  }
                                                  placeholder="Option 1
Option 2
Option 3"
                                                  rows={4}
                                                />
                                              </FormControl>{" "}
                                              <FormMessage />{" "}
                                            </FormItem>
                                          )}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No fields added yet. Click &quot;Add Field`&quot; below.
                            </p>
                          )}
                          {providedDrop.placeholder} {/* DnD placeholder */}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <Button
                    type="button"
                    onClick={addField}
                    variant="outline"
                    size="sm"
                    className="mt-6"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Field
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Settings Tab Content --- */}
            <TabsContent value="settings" className="mt-6 space-y-6">
              {/* Group related settings in Cards */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Submission Handling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="settings.submitButtonText"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Submit Button Text</FormLabel>{" "}
                        <FormControl>
                          <Input {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="settings.successMessage"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Success Message</FormLabel>{" "}
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Message shown after successful submission."
                            rows={3}
                          />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="settings.redirectUrl"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Redirect URL (Optional)</FormLabel>{" "}
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://example.com/thank-you"
                          />
                        </FormControl>{" "}
                        <FormDescription>
                          Leave blank to show the success message instead.
                        </FormDescription>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Email & Spam</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="settings.doubleOptIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        {" "}
                        <div className="space-y-0.5 pr-4">
                          {" "}
                          <FormLabel>Enable Double Opt-In</FormLabel>{" "}
                          <FormDescription>
                            Require email confirmation before subscribing.
                          </FormDescription>{" "}
                        </div>{" "}
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="settings.honeypotEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        {" "}
                        <div className="space-y-0.5 pr-4">
                          {" "}
                          <FormLabel>Enable Honeypot Field</FormLabel>{" "}
                          <FormDescription>
                            Basic bot protection using a hidden field.
                          </FormDescription>{" "}
                        </div>{" "}
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="settings.recaptchaEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        {" "}
                        <div className="space-y-0.5 pr-4">
                          {" "}
                          <FormLabel>Enable Google reCAPTCHA v2</FormLabel>{" "}
                          <FormDescription>
                            Requires site key configuration below.
                          </FormDescription>{" "}
                        </div>{" "}
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>{" "}
                      </FormItem>
                    )}
                  />
                  {form.watch("settings.recaptchaEnabled") && (
                    <FormField
                      control={form.control}
                      name="settings.recaptchaSiteKey"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>reCAPTCHA Site Key</FormLabel>{" "}
                          <FormControl>
                            <Input {...field} placeholder="Enter your v2 Checkbox site key" />
                          </FormControl>{" "}
                          <FormDescription>
                            Get this key from your Google reCAPTCHA admin console.
                          </FormDescription>
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Style Tab Content --- */}
            <TabsContent value="style" className="mt-6 space-y-4">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Color Palette</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <FormField
                    control={form.control}
                    name="style.primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Primary</FormLabel>{" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <FormControl>
                            <Input
                              aria-label="Primary color picker"
                              {...field}
                              type="color"
                              className="w-10 h-10 p-0 border-none cursor-pointer rounded"
                            />
                          </FormControl>{" "}
                          <Input
                            aria-label="Primary color hex value"
                            value={field.value}
                            onChange={field.onChange}
                            className="font-mono text-sm"
                          />{" "}
                        </div>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="style.backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Background</FormLabel>{" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <FormControl>
                            <Input
                              aria-label="Background color picker"
                              {...field}
                              type="color"
                              className="w-10 h-10 p-0 border-none cursor-pointer rounded"
                            />
                          </FormControl>{" "}
                          <Input
                            aria-label="Background color hex value"
                            value={field.value}
                            onChange={field.onChange}
                            className="font-mono text-sm"
                          />{" "}
                        </div>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="style.textColor"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Text</FormLabel>{" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <FormControl>
                            <Input
                              aria-label="Text color picker"
                              {...field}
                              type="color"
                              className="w-10 h-10 p-0 border-none cursor-pointer rounded"
                            />
                          </FormControl>{" "}
                          <Input
                            aria-label="Text color hex value"
                            value={field.value}
                            onChange={field.onChange}
                            className="font-mono text-sm"
                          />{" "}
                        </div>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <FormField
                    control={form.control}
                    name="style.fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Font</FormLabel>{" "}
                        <Select value={field.value} onValueChange={field.onChange}>
                          {" "}
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>{" "}
                          <SelectContent>
                            {" "}
                            <SelectItem value="Inter, sans-serif">Inter</SelectItem>{" "}
                            <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>{" "}
                            <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>{" "}
                            <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>{" "}
                            <SelectItem value="system-ui, sans-serif">
                              System Default
                            </SelectItem>{" "}
                          </SelectContent>{" "}
                        </Select>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="style.borderRadius"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Corner Radius</FormLabel>{" "}
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          {" "}
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>{" "}
                          <SelectContent>
                            {" "}
                            <SelectItem value="0">Sharp (0px)</SelectItem>{" "}
                            <SelectItem value="2">Minimal (2px)</SelectItem>{" "}
                            <SelectItem value="4">Small (4px)</SelectItem>{" "}
                            <SelectItem value="6">Medium (6px)</SelectItem>{" "}
                            <SelectItem value="8">Large (8px)</SelectItem>{" "}
                            <SelectItem value="12">X-Large (12px)</SelectItem>{" "}
                            <SelectItem value="9999">Pill</SelectItem>{" "}
                          </SelectContent>{" "}
                        </Select>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="style.buttonStyle"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Button Style</FormLabel>{" "}
                        <Select value={field.value} onValueChange={field.onChange}>
                          {" "}
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>{" "}
                          <SelectContent>
                            {" "}
                            <SelectItem value="filled">Filled</SelectItem>{" "}
                            <SelectItem value="outline">Outline</SelectItem>{" "}
                            <SelectItem value="minimal">Minimal (Text)</SelectItem>{" "}
                          </SelectContent>{" "}
                        </Select>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

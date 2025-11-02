"use client"; // Ensure this directive is needed based on your project setup

import { useState } from "react";
// Import specific RHF types if needed, but usually inferred correctly
import { useForm, Control, SubmitHandler, UseFormReturn, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
  // Correct specific types if available, or use provided as is
  // DragStart, ResponderProvided
} from "@hello-pangea/dnd"; // Changed from @hello-pangea/dnd
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

type FormBuilderProps = {
  initialValues?: Partial<FormValues>; // Allow partial initial values
  onSubmit: (values: FormValues) => Promise<void>;
  onPreview: (values: FormValues) => void;
  onGenerateCode: (values: FormValues) => void;
};

// --- Form Builder Component ---
export function FormBuilder({
  initialValues,
  onSubmit,
  onPreview,
  onGenerateCode,
}: FormBuilderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");

  // Provide default values ensuring alignment with the schema
  const defaultValues: FormValues = {
    name: initialValues?.name ?? "My Subscription Form",
    description: initialValues?.description ?? "Collect subscribers for your newsletter",
    fields: initialValues?.fields ?? [
      {
        id: "email-" + Date.now(),
        type: "email",
        label: "Email Address", // More descriptive label
        placeholder: "your@email.com",
        required: true,
        options: [], // Ensure options is initialized for 'select' if needed
      },
    ],
    settings: {
      submitButtonText: initialValues?.settings?.submitButtonText ?? "Subscribe",
      successMessage: initialValues?.settings?.successMessage ?? "Thank you for subscribing!",
      doubleOptIn: initialValues?.settings?.doubleOptIn ?? false,
      redirectUrl: initialValues?.settings?.redirectUrl ?? "",
      honeypotEnabled: initialValues?.settings?.honeypotEnabled ?? true,
      recaptchaEnabled: initialValues?.settings?.recaptchaEnabled ?? false,
      recaptchaSiteKey: initialValues?.settings?.recaptchaSiteKey ?? "",
    },
    style: {
      primaryColor: initialValues?.style?.primaryColor ?? "#3b82f6",
      backgroundColor: initialValues?.style?.backgroundColor ?? "#ffffff",
      textColor: initialValues?.style?.textColor ?? "#000000",
      fontFamily: initialValues?.style?.fontFamily ?? "Inter, sans-serif",
      borderRadius: initialValues?.style?.borderRadius ?? "4",
      buttonStyle: initialValues?.style?.buttonStyle ?? "filled",
    },
  };

  // Type useForm explicitly
  // @ts-expect-error - useForm is compatible with zod
  const form: UseFormReturn<FormValues> = useForm<FormValues>({
    // Remove 'as any' - zodResolver should be compatible if types/versions match
    // @ts-expect-error - zodResolver is compatible with zod
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange", // Or "onBlur" etc. for validation timing
  });

  // `fields` is correctly inferred from form.watch() based on FormValues['fields']
  const fields = form.watch("fields");

  // --- Handlers ---

  // Define handleSubmit explicitly with SubmitHandler type
  const handleFormSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      // Optionally reset the form or show success state here if onSubmit doesn't handle it
      // form.reset(values); // Reset with saved values
    } catch (error) {
      console.error("Error during form submission:", error);
      // Optionally display error to user using toast or state
    } finally {
      setIsSubmitting(false);
    }
  };

  const addField = () => {
    const newField: FormValues["fields"][number] = {
      // Use type from schema
      id: `field-${Date.now()}`,
      type: "text", // Default to text
      label: "New Field",
      placeholder: "",
      required: false,
      options: [], // Ensure options array is present, especially for 'select' type
    };
    // Ensure fields is treated as an array before spreading
    const currentFields = Array.isArray(fields) ? fields : [];
    form.setValue("fields", [...currentFields, newField], {
      shouldValidate: true,
      shouldDirty: true,
    }); // Trigger validation
  };

  const removeField = (idToRemove: string) => {
    const currentFields = Array.isArray(fields) ? fields : [];
    form.setValue(
      "fields",
      currentFields.filter((field: any) => field.id !== idToRemove),
      { shouldValidate: true, shouldDirty: true } // Trigger validation
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // Dropped outside the list

    const currentFields = Array.isArray(fields) ? fields : [];
    if (source.index === destination.index) return; // No change

    const items = Array.from(currentFields);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    form.setValue("fields", items, { shouldDirty: true }); // Just mark as dirty, validation runs later
  };

  // --- JSX ---
  return (
    <div className="space-y-6">
      <Form {...form}>
        {/* Use the correctly typed handleFormSubmit */}
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* --- Header Section --- */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-grow">
              {" "}
              {/* Allow name field to take space */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Form Name</FormLabel>{" "}
                    {/* Use sr-only if label is visually implied */}
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Form Name"
                        className="text-lg font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-1">
                    <FormLabel className="sr-only">Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter a short description (optional)"
                        className="text-sm text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Actions aligned to the right */}
            <div className="flex gap-2 flex-shrink-0 self-start md:self-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPreview(form.getValues())}
              >
                <Eye className="h-4 w-4 mr-1" /> Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onGenerateCode(form.getValues())}
              >
                <Code className="h-4 w-4 mr-1" /> Code
              </Button>
              <Button type="submit" disabled={isSubmitting} size="sm">
                {isSubmitting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                {isSubmitting ? "Saving..." : "Save Form"}
              </Button>
            </div>
          </div>

          {/* --- Tabs --- */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fields">
                <Plus className="h-4 w-4 mr-2 sm:mr-1 md:mr-2" /> Fields
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2 sm:mr-1 md:mr-2" /> Settings
              </TabsTrigger>
              <TabsTrigger value="style">
                <Paintbrush className="h-4 w-4 mr-2 sm:mr-1 md:mr-2" /> Design
              </TabsTrigger>
            </TabsList>

            {/* --- Fields Tab --- */}
            <TabsContent value="fields" className="mt-6 space-y-4">
              {" "}
              {/* Added margin-top */}
              <Card>
                {/* Removed CardHeader for tighter look, Title moved */}
                <CardContent className="pt-6">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="fields">
                      {(provided: DroppableProvided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {Array.isArray(fields) &&
                            fields.map(
                              (
                                fieldItem,
                                index // Added Array.isArray check
                              ) => (
                                <Draggable
                                  key={fieldItem.id}
                                  draggableId={fieldItem.id}
                                  index={index}
                                >
                                  {(
                                    providedDraggable: DraggableProvided // Renamed variable
                                  ) => (
                                    <div
                                      ref={providedDraggable.innerRef}
                                      {...providedDraggable.draggableProps}
                                      className="border rounded-lg p-4 bg-background shadow-sm" // Use background color
                                    >
                                      {/* Field Header: Drag Handle & Remove Button */}
                                      <div className="flex justify-between items-center mb-3 border-b pb-2">
                                        <div
                                          {...providedDraggable.dragHandleProps}
                                          className="cursor-grab p-1 text-muted-foreground hover:text-foreground"
                                          aria-label="Drag to reorder field"
                                        >
                                          <Grip className="h-5 w-5" />
                                        </div>
                                        {/* Show field label in header for context */}
                                        <span className="text-sm font-medium text-muted-foreground truncate px-2">
                                          {form.getValues(`fields.${index}.label`) ||
                                            `Field ${index + 1}`}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon" // Use icon size
                                          onClick={() => removeField(fieldItem.id)}
                                          className="text-destructive hover:bg-destructive/10 h-7 w-7" // Destructive variant style
                                          aria-label="Remove field"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      {/* Field Configuration Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Field Type Select */}
                                        <FormField
                                          control={form.control}
                                          name={`fields.${index}.type`}
                                          render={(
                                            { field: typeField } // Scoped field render prop variable
                                          ) => (
                                            <FormItem>
                                              <FormLabel>Field Type</FormLabel>
                                              {/* Use Select component */}
                                              <Select
                                                value={typeField.value}
                                                onValueChange={typeField.onChange}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select field type" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  {FIELD_TYPES.map((typeOpt: any) => (
                                                    <SelectItem
                                                      key={typeOpt.value}
                                                      value={typeOpt.value}
                                                    >
                                                      {typeOpt.label}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        {/* Field Label Input */}
                                        <FormField
                                          control={form.control}
                                          name={`fields.${index}.label`}
                                          render={({ field: labelField }) => (
                                            <FormItem>
                                              <FormLabel>Label</FormLabel>
                                              <FormControl>
                                                <Input
                                                  {...labelField}
                                                  placeholder="Enter field label"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        {/* Placeholder Input (conditional) */}
                                        {fieldItem.type !== "checkbox" && (
                                          <FormField
                                            control={form.control}
                                            name={`fields.${index}.placeholder`}
                                            render={({ field: placeholderField }) => (
                                              <FormItem>
                                                <FormLabel>Placeholder (Optional)</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    {...placeholderField}
                                                    placeholder="Enter placeholder text"
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        )}

                                        {/* Required Switch */}
                                        <FormField
                                          control={form.control}
                                          name={`fields.${index}.required`}
                                          render={({ field: requiredField }) => (
                                            // Use flex-col for better alignment on smaller screens maybe
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-1 md:col-span-1">
                                              <div className="space-y-0.5 pr-4">
                                                {" "}
                                                {/* Add padding right */}
                                                <FormLabel className="text-sm">Required</FormLabel>
                                                {/* Simplified description */}
                                                {/* <FormDescription>Is this field mandatory?</FormDescription> */}
                                              </div>
                                              <FormControl>
                                                <Switch
                                                  checked={requiredField.value}
                                                  onCheckedChange={requiredField.onChange}
                                                  aria-label="Mark field as required"
                                                />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />

                                        {/* Options Textarea (conditional) */}
                                        {fieldItem.type === "select" && (
                                          <FormField
                                            control={form.control}
                                            name={`fields.${index}.options`}
                                            render={({ field: optionsField }) => (
                                              <FormItem className="md:col-span-2">
                                                {" "}
                                                {/* Span full width on medium+ */}
                                                <FormLabel>Dropdown Options</FormLabel>
                                                <FormControl>
                                                  <Textarea
                                                    // Field value expects string[], Textarea value is string
                                                    value={(optionsField.value ?? []).join("\n")}
                                                    onChange={(e) => {
                                                      // Convert string back to string[] for the form state
                                                      const optionsArray = e.target.value
                                                        .split("\n")
                                                        .map((opt: any) => opt.trim()) // Trim whitespace
                                                        .filter(Boolean); // Remove empty lines
                                                      optionsField.onChange(optionsArray);
                                                    }}
                                                    placeholder="Enter one option per line"
                                                    rows={3}
                                                  />
                                                </FormControl>
                                                <FormDescription>
                                                  Each line represents one option.
                                                </FormDescription>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            )}
                          {provided.placeholder} {/* Placeholder for dnd */}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  <Button
                    type="button"
                    onClick={addField}
                    variant="secondary"
                    className="mt-6 w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Form Field
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Settings Tab --- */}
            <TabsContent value="settings" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {" "}
                  {/* Increased spacing */}
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
                  <FormField
                    control={form.control}
                    name="settings.doubleOptIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        {" "}
                        <div className="space-y-0.5 pr-4">
                          {" "}
                          <FormLabel>Double Opt-In</FormLabel>{" "}
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
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Spam Protection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="settings.honeypotEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
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
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Style Tab --- */}
            <TabsContent value="style" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Form Styling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    {/* Increased gap */}
                    {/* Color Pickers */}
                    <FormField
                      control={form.control}
                      name="style.primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>Primary Color (Buttons, Accents)</FormLabel>{" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <FormControl>
                              <Input
                                {...field}
                                type="color"
                                className="w-10 h-10 p-1 border-none cursor-pointer rounded"
                              />
                            </FormControl>{" "}
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                              className="flex-1 font-mono text-sm"
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
                          <FormLabel>Background Color</FormLabel>{" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <FormControl>
                              <Input
                                {...field}
                                type="color"
                                className="w-10 h-10 p-1 border-none cursor-pointer rounded"
                              />
                            </FormControl>{" "}
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                              className="flex-1 font-mono text-sm"
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
                          <FormLabel>Text Color</FormLabel>{" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <FormControl>
                              <Input
                                {...field}
                                type="color"
                                className="w-10 h-10 p-1 border-none cursor-pointer rounded"
                              />
                            </FormControl>{" "}
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                              className="flex-1 font-mono text-sm"
                            />{" "}
                          </div>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />
                    {/* Select Inputs */}
                    <FormField
                      control={form.control}
                      name="style.fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>Font Family</FormLabel>{" "}
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
                          <FormLabel>Border Radius (px)</FormLabel>{" "}
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
                              <SelectItem value="0">Square (0)</SelectItem>{" "}
                              <SelectItem value="2">Slight (2)</SelectItem>{" "}
                              <SelectItem value="4">Small (4)</SelectItem>{" "}
                              <SelectItem value="6">Medium (6)</SelectItem>{" "}
                              <SelectItem value="8">Large (8)</SelectItem>{" "}
                              <SelectItem value="12">X-Large (12)</SelectItem>{" "}
                              <SelectItem value="9999">Pill (Full)</SelectItem>{" "}
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
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="filled">Filled</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>{" "}
                              <SelectItem value="minimal">Minimal (Text)</SelectItem>{" "}
                            </SelectContent>{" "}
                          </Select>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

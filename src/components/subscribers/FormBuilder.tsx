import { useState } from "react";
import { useForm, Control, SubmitHandler, UseFormReturn } from "react-hook-form";
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

const formSchema = z.object({
  name: z.string().min(1, { message: "Form name is required" }),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["text", "email", "number", "checkbox", "select"]),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ),
  settings: z.object({
    submitButtonText: z.string().default("Subscribe"),
    successMessage: z.string().default("Thank you for subscribing!"),
    doubleOptIn: z.boolean().default(false),
    redirectUrl: z.string().optional(),
    honeypotEnabled: z.boolean().default(true),
    recaptchaEnabled: z.boolean().default(false),
    recaptchaSiteKey: z.string().optional(),
  }),
  style: z.object({
    primaryColor: z.string().default("#3b82f6"),
    backgroundColor: z.string().default("#ffffff"),
    textColor: z.string().default("#000000"),
    fontFamily: z.string().default("Inter, sans-serif"),
    borderRadius: z.string().default("4"),
    buttonStyle: z.enum(["filled", "outline", "minimal"]).default("filled"),
  }),
});

export type FormValues = z.infer<typeof formSchema>;

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Dropdown" },
];

type FormBuilderProps = {
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  onPreview: (values: FormValues) => void;
  onGenerateCode: (values: FormValues) => void;
};

export function FormBuilder({
  initialValues,
  onSubmit,
  onPreview,
  onGenerateCode,
}: FormBuilderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");

  const defaultValues: FormValues = initialValues || {
    name: "My Subscription Form",
    description: "Collect subscribers for your newsletter",
    fields: [
      {
        id: "email-" + Date.now(),
        type: "email",
        label: "Email",
        placeholder: "your@email.com",
        required: true,
      },
    ],
    settings: {
      submitButtonText: "Subscribe",
      successMessage: "Thank you for subscribing!",
      doubleOptIn: false,
      redirectUrl: "",
      honeypotEnabled: true,
      recaptchaEnabled: false,
      recaptchaSiteKey: "",
    },
    style: {
      primaryColor: "#3b82f6",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontFamily: "Inter, sans-serif",
      borderRadius: "4",
      buttonStyle: "filled",
    },
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  });

  const { fields } = form.watch();

  const handleSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: "text" as const,
      label: "New Field",
      placeholder: "",
      required: false,
    };
    form.setValue("fields", [...fields, newField]);
  };

  const removeField = (id: string) => {
    form.setValue(
      "fields",
      fields.filter((field) => field.id !== id)
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setValue("fields", items);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6 w-full">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1 space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My Subscription Form" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onPreview(form.getValues())}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onGenerateCode(form.getValues())}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Get Code
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Form
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter a description for your form" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fields">
                  <Plus className="h-4 w-4 mr-2" />
                  Form Fields
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="style">
                  <Paintbrush className="h-4 w-4 mr-2" />
                  Design
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="fields">
                        {(provided: DroppableProvided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {fields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided: DraggableProvided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="border rounded-md p-4 bg-white dark:bg-gray-800"
                                  >
                                    <div className="flex justify-between items-start mb-4">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-move p-2"
                                      >
                                        <Grip className="h-4 w-4 text-gray-400" />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeField(field.id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`fields.${index}.type`}
                                        render={({ field: typeField }) => (
                                          <FormItem>
                                            <FormLabel>Field Type</FormLabel>
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
                                                {FIELD_TYPES.map((type) => (
                                                  <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name={`fields.${index}.label`}
                                        render={({ field: labelField }) => (
                                          <FormItem>
                                            <FormLabel>Label</FormLabel>
                                            <FormControl>
                                              <Input {...labelField} placeholder="Field Label" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      {field.type !== "checkbox" && (
                                        <FormField
                                          control={form.control}
                                          name={`fields.${index}.placeholder`}
                                          render={({ field: placeholderField }) => (
                                            <FormItem>
                                              <FormLabel>Placeholder</FormLabel>
                                              <FormControl>
                                                <Input
                                                  {...placeholderField}
                                                  placeholder="Field Placeholder"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      )}

                                      <FormField
                                        control={form.control}
                                        name={`fields.${index}.required`}
                                        render={({ field: requiredField }) => (
                                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <div className="space-y-0.5">
                                              <FormLabel>Required Field</FormLabel>
                                              <FormDescription>
                                                Make this field mandatory
                                              </FormDescription>
                                            </div>
                                            <FormControl>
                                              <Switch
                                                checked={requiredField.value}
                                                onCheckedChange={requiredField.onChange}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />

                                      {field.type === "select" && (
                                        <FormField
                                          control={form.control}
                                          name={`fields.${index}.options`}
                                          render={({ field: optionsField }) => (
                                            <FormItem className="col-span-2">
                                              <FormLabel>Options</FormLabel>
                                              <FormControl>
                                                <Textarea
                                                  {...optionsField}
                                                  placeholder="Enter options, one per line"
                                                  value={(optionsField.value || []).join("\n")}
                                                  onChange={(e) =>
                                                    optionsField.onChange(
                                                      e.target.value
                                                        .split("\n")
                                                        .filter((opt) => opt.trim())
                                                    )
                                                  }
                                                />
                                              </FormControl>
                                              <FormDescription>
                                                Enter one option per line
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
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <Button type="button" onClick={addField} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="settings.submitButtonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Submit Button Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Subscribe" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settings.successMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Success Message</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Thank you for subscribing!" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settings.doubleOptIn"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Double Opt-In</FormLabel>
                            <FormDescription>
                              Send confirmation email to verify subscribers
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settings.redirectUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redirect URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/thank-you" />
                          </FormControl>
                          <FormDescription>Redirect users after form submission</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settings.honeypotEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Honeypot Protection</FormLabel>
                            <FormDescription>
                              Adds invisible field to detect spam submissions
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="settings.recaptchaEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>reCAPTCHA</FormLabel>
                            <FormDescription>
                              Add Google reCAPTCHA to prevent bot submissions
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("settings.recaptchaEnabled") && (
                      <FormField
                        control={form.control}
                        name="settings.recaptchaSiteKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>reCAPTCHA Site Key</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter your reCAPTCHA site key" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Design</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="style.primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="color" className="w-12 h-10 p-1" />
                              </FormControl>
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style.backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="color" className="w-12 h-10 p-1" />
                              </FormControl>
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style.textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="color" className="w-12 h-10 p-1" />
                              </FormControl>
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style.fontFamily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Family</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select font family" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                                <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                                <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                                <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                                <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style.borderRadius"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Border Radius</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select border radius" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">Square (0px)</SelectItem>
                                <SelectItem value="2">Slight (2px)</SelectItem>
                                <SelectItem value="4">Rounded (4px)</SelectItem>
                                <SelectItem value="8">Medium (8px)</SelectItem>
                                <SelectItem value="12">Large (12px)</SelectItem>
                                <SelectItem value="999">Full (999px)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style.buttonStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Style</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select button style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="filled">Filled</SelectItem>
                                <SelectItem value="outline">Outline</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
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
    </div>
  );
}

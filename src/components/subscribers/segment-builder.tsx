"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon, SaveIcon, Loader2 } from "lucide-react"; // Added SaveIcon, Loader2
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

interface SegmentBuilderProps {
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    rules: SegmentRule[];
  };
  onCancel?: () => void;
  // Add useToast or a similar notification mechanism if replacing alerts
  // toast: (options: any) => void;
}

// Base styling for input-like elements, aligned with DS
const inputBaseClasses =
  "bg-slate-900 border border-slate-700 text-slate-300 placeholder:text-slate-500 text-sm rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 block w-full";
const inputSizingClasses = "h-10 px-3 py-2"; // For standard inputs and select triggers
const selectTriggerClasses = `${inputBaseClasses} ${inputSizingClasses} flex items-center justify-between [&>svg]:text-slate-400 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:ml-2`;

export function SegmentBuilder({ initialData, onCancel }: SegmentBuilderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [rules, setRules] = useState<SegmentRule[]>(
    initialData?.rules || [{ field: "email", operator: "contains", value: "" }]
  );

  const addRule = () => {
    setRules([...rules, { field: "email", operator: "contains", value: "" }]);
  };

  const removeRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const updateRule = (index: number, field: keyof SegmentRule, value: string) => {
    const newRules = [...rules];
    // Reset operator if field changes to a type with different operators
    if (field === "field" && newRules[index].field !== value) {
      const defaultOperator =
        operatorOptions[value as keyof typeof operatorOptions]?.[0]?.value || "contains";
      newRules[index] = {
        ...newRules[index],
        [field]: value,
        operator: defaultOperator,
        value: "",
      };
    } else {
      newRules[index] = { ...newRules[index], [field]: value };
    }
    setRules(newRules);
  };

  // Check if the value input should be disabled based on operator
  const isValueInputDisabled = (operator: string): boolean => {
    return ["exists", "notExists"].includes(operator);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Segment name is required."); // TODO: Replace with toast
      return;
    }

    if (rules.length === 0) {
      alert("At least one rule is required."); // TODO: Replace with toast
      return;
    }

    // Only validate values for operators that need them
    const invalidRule = rules.find(
      (rule) => !isValueInputDisabled(rule.operator) && !rule.value.trim()
    );

    if (invalidRule) {
      alert("All rules must have a value unless they don't require one."); // TODO: Replace with toast
      return;
    }

    setLoading(true);

    try {
      const endpoint = initialData?.id
        ? `/api/subscribers/segments/${initialData.id}`
        : "/api/subscribers/segments";

      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, rules }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to save segment");
      }
      // alert("Segment saved successfully!"); // TODO: Replace with toast
      // Optionally call a success callback or handle navigation internally
      if (onCancel) onCancel(); // Close modal or navigate away after success
      router.push("/dashboard/subscribers?tab=segments"); // Or a more specific page
      router.refresh(); // Refresh data on the target page
    } catch (error) {
      console.error("Error saving segment:", error);
      alert(error instanceof Error ? error.message : "An unexpected error occurred."); // TODO: Replace with toast
    } finally {
      setLoading(false);
    }
  };

  const fieldOptions = [
    { value: "email", label: "Email" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "status", label: "Status (active, unsubscribed)" },
    { value: "tags", label: "Tags (comma-separated)" },
    { value: "createdAt", label: "Date Added (YYYY-MM-DD)" },
  ];

  const operatorOptions: Record<string, { value: string; label: string }[]> = {
    email: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "startsWith", label: "Starts with" },
      { value: "endsWith", label: "Ends with" },
      { value: "notContains", label: "Does not contain" },
      { value: "notEquals", label: "Does not equal" },
    ],
    firstName: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "exists", label: "Is not empty (any value)" },
      { value: "notExists", label: "Is empty (no value)" },
    ],
    lastName: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "exists", label: "Is not empty (any value)" },
      { value: "notExists", label: "Is empty (no value)" },
    ],
    status: [
      // e.g., active, unsubscribed, bounced
      { value: "equals", label: "Equals" },
      { value: "notEquals", label: "Does not equal" },
    ],
    tags: [
      // e.g. "newsletter, vip"
      { value: "contains", label: "Contains tag" }, // checks if one of the tags in subscriber's list is the value
      { value: "notContains", label: "Does not contain tag" },
      { value: "equals", label: "Tags exactly match (all)" }, // if subscriber has "vip, newsletter" value must be "vip, newsletter" or "newsletter, vip"
    ],
    createdAt: [
      // Expects YYYY-MM-DD
      { value: "on", label: "On date" },
      { value: "before", label: "Before date" },
      { value: "after", label: "After date" },
      { value: "between", label: "Between dates (val1,val2)" }, // Special handling for value
    ],
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl">
        <CardHeader className="border-b border-slate-700/50 px-6 py-4">
          <CardTitle className="text-slate-100 font-semibold text-lg">
            {initialData?.id ? "Edit Segment" : "Create New Segment"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-slate-300">
              Segment Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., VIP Customers, Newsletter Subscribers"
              required
              className={`${inputBaseClasses} ${inputSizingClasses}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-slate-300">
              Description <span className="text-slate-500">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of who this segment includes"
              rows={2}
              className={`${inputBaseClasses} py-2 px-3 min-h-[60px]`}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-slate-200">Matching Rules</Label>
              <span className="text-xs text-slate-400">Subscribers must match ALL rules</span>
            </div>

            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 border border-slate-700 rounded-md bg-slate-800/60"
                >
                  <div className="flex-grow sm:flex-grow-0 sm:w-1/3 space-y-1.5">
                    <Label
                      htmlFor={`field-${index}`}
                      className="text-xs font-medium text-slate-400"
                    >
                      Field
                    </Label>
                    <Select
                      value={rule.field}
                      onValueChange={(value) => updateRule(index, "field", value)}
                    >
                      <SelectTrigger id={`field-${index}`} className={selectTriggerClasses}>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-300 rounded-md shadow-lg">
                        {fieldOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-slate-700/50 data-[highlighted]:bg-slate-700/80 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-emerald-50 rounded-sm text-sm"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-grow sm:flex-grow-0 sm:w-1/3 space-y-1.5">
                    <Label
                      htmlFor={`operator-${index}`}
                      className="text-xs font-medium text-slate-400"
                    >
                      Condition
                    </Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(value) => updateRule(index, "operator", value)}
                      disabled={!operatorOptions[rule.field as keyof typeof operatorOptions]}
                    >
                      <SelectTrigger id={`operator-${index}`} className={selectTriggerClasses}>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-300 rounded-md shadow-lg">
                        {(operatorOptions[rule.field as keyof typeof operatorOptions] || []).map(
                          (option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="hover:bg-slate-700/50 data-[highlighted]:bg-slate-700/80 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-emerald-50 rounded-sm text-sm"
                            >
                              {option.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-grow space-y-1.5">
                    <Label
                      htmlFor={`value-${index}`}
                      className={`text-xs font-medium ${
                        isValueInputDisabled(rule.operator) ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Value {isValueInputDisabled(rule.operator) ? "(not required)" : ""}
                    </Label>
                    <Input
                      id={`value-${index}`}
                      value={rule.value}
                      onChange={(e) => updateRule(index, "value", e.target.value)}
                      placeholder={
                        isValueInputDisabled(rule.operator)
                          ? "No value needed"
                          : rule.field === "createdAt"
                            ? "YYYY-MM-DD"
                            : rule.field === "tags"
                              ? "tag1, tag2"
                              : rule.field === "status"
                                ? "active"
                                : "Enter value"
                      }
                      type={rule.field === "createdAt" ? "date" : "text"}
                      className={`${inputBaseClasses} ${inputSizingClasses} ${
                        !rule.value && !isValueInputDisabled(rule.operator)
                          ? "border-amber-600/50"
                          : ""
                      } ${isValueInputDisabled(rule.operator) ? "opacity-60 bg-slate-800/60" : ""}`}
                      disabled={isValueInputDisabled(rule.operator)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon" // shadcn h-10 w-10
                    onClick={() => removeRule(index)}
                    disabled={rules.length <= 1} // Keep at least one rule
                    className="p-2.5 self-end sm:self-end text-slate-500 hover:text-red-500 hover:bg-red-900/20 rounded-md disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:bg-transparent"
                    aria-label="Remove rule"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm" // DS: h-8 px-3 text-sm, shadcn h-9 px-3 text-sm
              onClick={addRule}
              className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 h-9 px-3 text-sm rounded-md flex items-center gap-1.5"
            >
              <PlusIcon className="h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-slate-700/50">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 h-10 px-4 rounded-md"
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={
              loading ||
              !name.trim() ||
              rules.some((rule) => !isValueInputDisabled(rule.operator) && !rule.value.trim())
            }
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-md flex items-center justify-center gap-2 disabled:bg-emerald-700/60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                {initialData?.id ? "Save Changes" : "Create Segment"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

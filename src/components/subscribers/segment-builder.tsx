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
import { PlusIcon, TrashIcon, Save } from "lucide-react";
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
}

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
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      alert("Segment name is required");
      return;
    }

    if (rules.length === 0) {
      alert("At least one rule is required");
      return;
    }

    if (rules.some((rule) => !rule.value)) {
      alert("All rules must have a value");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          rules,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save segment");
      }

      router.push("/dashboard/subscribers?tab=segments");
      router.refresh();
    } catch (error) {
      console.error("Error saving segment:", error);
      alert(error instanceof Error ? error.message : "Failed to save segment");
    } finally {
      setLoading(false);
    }
  };

  const fieldOptions = [
    { value: "email", label: "Email" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "status", label: "Status" },
    { value: "tags", label: "Tags" },
    { value: "createdAt", label: "Date Added" },
  ];

  const operatorOptions = {
    email: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "startsWith", label: "Starts with" },
      { value: "endsWith", label: "Ends with" },
    ],
    firstName: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "exists", label: "Is not empty" },
    ],
    lastName: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
      { value: "exists", label: "Is not empty" },
    ],
    status: [{ value: "equals", label: "Equals" }],
    tags: [{ value: "contains", label: "Contains" }],
    createdAt: [
      { value: "greaterThan", label: "After" },
      { value: "lessThan", label: "Before" },
    ],
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData?.id ? "Edit Segment" : "Create Segment"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Segment Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Active Subscribers, Recent Signups"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for this segment"
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Matching Rules</Label>
              <span className="text-sm text-muted-foreground">
                Subscribers must match ALL of the following rules
              </span>
            </div>

            {rules.map((rule: any, index: any) => (
              <div key={index} className="flex items-end gap-2">
                <div className="w-1/3">
                  <Label htmlFor={`field-${index}`} className="mb-2 block text-sm">
                    Field
                  </Label>
                  <Select
                    value={rule.field}
                    onValueChange={(value) => updateRule(index, "field", value)}
                  >
                    <SelectTrigger id={`field-${index}`}>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-1/3">
                  <Label htmlFor={`operator-${index}`} className="mb-2 block text-sm">
                    Condition
                  </Label>
                  <Select
                    value={rule.operator}
                    onValueChange={(value) => updateRule(index, "operator", value)}
                  >
                    <SelectTrigger id={`operator-${index}`}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions[rule.field as keyof typeof operatorOptions]?.map(
                        (option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label htmlFor={`value-${index}`} className="mb-2 block text-sm">
                    Value
                  </Label>
                  <Input
                    id={`value-${index}`}
                    value={rule.value}
                    onChange={(e) => updateRule(index, "value", e.target.value)}
                    placeholder="Enter value"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(index)}
                  disabled={rules.length === 1}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addRule} className="mt-2">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Segment
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

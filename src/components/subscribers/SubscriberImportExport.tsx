"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card, // Not used, remove?
  CardContent, // Not used, remove?
  CardDescription, // Not used, remove?
  CardFooter, // Not used, remove?
  CardHeader, // Not used, remove?
  CardTitle, // Not used, remove?
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Download, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// --- Define types ---

// Represents a single subscriber entry parsed from CSV for the POST request
interface SubscriberInput {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  status?: "active" | "unsubscribed" | "bounced"; // Be explicit about allowed statuses
}

// Expected response structure from the POST /api/subscribers/bulk endpoint
interface ImportApiResponse {
  imported: number;
  skipped: number;
  failed: number;
  // Optionally add details about failures if the API provides them
  // errors?: { email: string; reason: string }[];
}

// Expected structure of a subscriber returned by the GET /api/subscribers/bulk endpoint
interface SubscriberExportData {
  email: string;
  firstName: string | null; // Allow null from DB
  lastName: string | null; // Allow null from DB
  status: string; // Use specific status enum if available
  tags: string[] | null; // Allow null from DB
  createdAt: string | Date; // Expect string or Date
}

// Expected response structure from the GET /api/subscribers/bulk endpoint
interface ExportApiResponse {
  subscribers: SubscriberExportData[];
}

type SubscriberImportExportProps = {
  className?: string;
  onComplete?: () => void;
};

// --- Component Implementation ---

export function SubscriberImportExport({ className, onComplete }: SubscriberImportExportProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("import");
  const [csvData, setCsvData] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  // Type the state for import results
  const [importResult, setImportResult] = useState<ImportApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleImport = async () => {
    setError(null); // Reset error first
    if (!csvData.trim()) {
      setError("Please paste valid CSV data into the text area.");
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);

      const lines = csvData.trim().split("\n");
      if (lines.length <= 1) {
        setError("CSV data must include a header row and at least one data row.");
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((h: any) => h.trim().toLowerCase().replace(/['"]+/g, "")); // Remove quotes and trim

      // Map header variations to standardized keys
      const headerMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        if (["email", "e-mail"].includes(header)) headerMap["email"] = index;
        if (["firstname", "first_name", "first name"].includes(header))
          headerMap["firstName"] = index;
        if (["lastname", "last_name", "last name"].includes(header)) headerMap["lastName"] = index;
        if (["tags", "tag"].includes(header)) headerMap["tags"] = index;
        if (["status", "state"].includes(header)) headerMap["status"] = index;
      });

      const emailIndex = headerMap["email"]; // Use mapped index

      if (emailIndex === undefined) {
        // Check if emailIndex exists in the map
        setError("CSV headers must contain an 'email' column (case-insensitive).");
        return;
      }

      const subscribers: SubscriberInput[] = []; // Use the defined type

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // Basic CSV parsing (handles commas within quoted fields minimally)
        // A robust library like Papaparse is recommended for complex CSVs
        const values =
          line
            .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
            ?.map((v: any) => v.trim().replace(/^"|"$/g, "")) ?? [];

        // Check if the number of values matches headers (basic validation)
        if (values.length !== headers.length) {
          console.warn(
            `Skipping row ${i + 1}: Mismatched number of columns. Expected ${headers.length}, found ${values.length}. Line: "${line}"`
          );
          // Consider adding this to a 'failed' count or error report
          continue;
        }

        const email = values[emailIndex];
        // Basic email validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          console.warn(
            `Skipping row ${i + 1}: Invalid or missing email address. Email: "${email}"`
          );
          // Add to failed count
          continue;
        }

        // Construct subscriber object using the type
        const subscriber: SubscriberInput = {
          email: email,
        };

        const firstNameIndex = headerMap["firstName"];
        if (firstNameIndex !== undefined && values[firstNameIndex]) {
          subscriber.firstName = values[firstNameIndex];
        }

        const lastNameIndex = headerMap["lastName"];
        if (lastNameIndex !== undefined && values[lastNameIndex]) {
          subscriber.lastName = values[lastNameIndex];
        }

        const tagsIndex = headerMap["tags"];
        if (tagsIndex !== undefined && values[tagsIndex]) {
          // Split by semicolon or comma, trim whitespace from each tag
          subscriber.tags = values[tagsIndex]
            .split(/[;,]/)
            .map((t: any) => t.trim())
            .filter((t: any) => t); // Filter out empty tags
        }

        const statusIndex = headerMap["status"];
        if (statusIndex !== undefined && values[statusIndex]) {
          const status = values[statusIndex].toLowerCase() as SubscriberInput["status"]; // Assert type after validation
          // @ts-expect-error - status is a valid type
          if (["active", "unsubscribed", "bounced"].includes(status)) {
            subscriber.status = status;
          } else {
            console.warn(
              `Row ${i + 1}: Invalid status "${values[statusIndex]}". Defaulting to 'active' or skipping based on rules.`
            );
            // Decide whether to default status or skip the row
          }
        }

        subscribers.push(subscriber);
      }

      if (subscribers.length === 0) {
        setError("No valid subscribers found in the provided CSV data after parsing.");
        return;
      }

      // Send to API
      const response = await fetch("/api/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribers }), // Send the array of subscribers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Attempt to parse error JSON
        const errorMessage = errorData?.message || `Import failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Type the response data
      const result: ImportApiResponse = await response.json();
      setImportResult(result);

      if (result.imported > 0) {
        toast({
          title: "Import successful",
          description: `${result.imported} subscribers imported, ${result.skipped} skipped, ${result.failed} failed`,
        });
        setCsvData(""); // Reset textarea on success
        if (onComplete) onComplete();
      } else {
        toast({
          title: "Import Completed",
          description: `Import process finished. Imported: ${result.imported}, Skipped: ${result.skipped}, Failed: ${result.failed}.`,
          variant: result.failed > 0 ? "destructive" : "default", // Use destructive if failures occurred
        });
        // Optionally clear textarea even if nothing was imported but no critical errors
        // setCsvData("");
      }
    } catch (err: unknown) {
      // Catch as unknown
      console.error("Error importing subscribers:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred during import";
      setError(errorMessage);
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);

      const response = await fetch("/api/subscribers/bulk"); // Assumes GET request

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.message || `Export failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Type the response data
      const apiResponse: ExportApiResponse = await response.json();

      if (!apiResponse.subscribers || apiResponse.subscribers.length === 0) {
        toast({
          title: "No Subscribers Found",
          description: "There are no active subscribers to export at this time.",
        });
        return;
      }

      // Convert to CSV
      const headers = ["email", "firstName", "lastName", "status", "tags", "createdAt"];
      const csvRows = [
        headers.join(","), // Header row
        // Map the typed subscriber data
        ...apiResponse.subscribers.map((sub: SubscriberExportData) => {
          // Sanitize data for CSV (basic example: ensure strings don't contain commas or wrap in quotes)
          const sanitize = (value: string | null | undefined): string => {
            if (value === null || value === undefined) return "";
            const str = String(value);
            // If value contains comma, newline, or double quote, wrap in double quotes and escape existing quotes
            if (str.includes(",") || str.includes("\n") || str.includes('"')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          };

          const date = sub.createdAt ? new Date(sub.createdAt).toISOString().split("T")[0] : "";
          const tags = Array.isArray(sub.tags) ? sub.tags.join(";") : ""; // Join tags with semicolon

          return [
            sanitize(sub.email),
            sanitize(sub.firstName),
            sanitize(sub.lastName),
            sanitize(sub.status),
            sanitize(tags),
            sanitize(date),
          ].join(",");
        }),
      ];

      const csvString = csvRows.join("\n");

      // Create and download file
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" }); // Specify charset
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); // Use 'link' instead of 'a' for clarity
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `subscribers_export_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up object URL

      toast({
        title: "Export Successful",
        description: `${apiResponse.subscribers.length} subscribers exported.`,
      });
      setOpen(false); // Close dialog on successful export
    } catch (err: unknown) {
      // Catch as unknown
      console.error("Error exporting subscribers:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred during export";
      setError(errorMessage);
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // --- Render JSX ---
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={cn("flex flex-col gap-2", className)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {" "}
            {/* Smaller button example */}
            <Upload className="h-4 w-4" />
            Import/Export
          </Button>
        </DialogTrigger>
      </div>

      {/* Use sm:max-w-xl or lg for wider */}
      <DialogContent className="sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Subscribers</DialogTitle>
          <DialogDescription>
            Import new subscribers via CSV paste or export your current list.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import from CSV</TabsTrigger>
            <TabsTrigger value="export">Export to CSV</TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4 pt-4">
            {" "}
            {/* Add padding top */}
            <div className="space-y-2 rounded-md border bg-muted/50 p-4">
              {" "}
              {/* Box for instructions */}
              <h4 className="font-semibold">Import Instructions:</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Paste CSV data below (including a header row).</li>
                <li>Required column: `email` (case-insensitive).</li>
                <li>
                  Optional columns: `firstName`, `lastName`, `tags` (separated by `;` or `,`),
                  `status` (`active`, `unsubscribed`, `bounced`).
                </li>
              </ul>
              <p className="text-sm font-medium pt-2">Example format:</p>
              <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                <code>
                  email,firstName,tags,status{"\n"}
                  john@example.com,John,newsletter;promo,active{"\n"}
                  jane@sample.org,Jane,&quot;tag a,tag b&quot;tag c&quot;,unsubscribed
                </code>
              </pre>
            </div>
            <Textarea
              id="csv-import-area"
              placeholder="Paste CSV data here, starting with the header row..."
              value={csvData}
              onChange={(e) => {
                setCsvData(e.target.value);
                setError(null);
                setImportResult(null);
              }} // Clear errors on change
              rows={10}
              className="font-mono text-xs sm:text-sm min-h-[150px]" // Adjust font size and height
              aria-label="Paste CSV data for import"
            />
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {importResult && (
              // Added mt-4 for spacing
              <Alert
                variant={
                  importResult.imported > 0 ||
                  (importResult.imported === 0 &&
                    importResult.failed === 0 &&
                    importResult.skipped > 0)
                    ? "default"
                    : "destructive"
                }
                className="mt-4"
              >
                <AlertCircle
                  className={`h-4 w-4 ${importResult.failed > 0 ? "text-destructive" : ""}`}
                />
                <AlertTitle>Import Results</AlertTitle>
                <AlertDescription>
                  {/* Use list for clarity */}
                  <ul className="list-disc list-inside text-sm">
                    <li>Successfully Imported: {importResult.imported}</li>
                    <li>Skipped (e.g., duplicates): {importResult.skipped}</li>
                    <li>Failed (e.g., invalid email): {importResult.failed}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {/* Ensure footer is within the TabsContent */}
            <DialogFooter className="pt-4">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {" "}
                {/* Ghost variant */}
                Close
              </Button>
              <Button onClick={handleImport} disabled={importing || !csvData.trim()}>
                {importing && <Spinner size="sm" className="mr-2" />}
                {importing ? "Importing..." : "Import Subscribers"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4 pt-4">
            {" "}
            {/* Add padding top */}
            <div className="space-y-2 rounded-md border bg-muted/50 p-4">
              {" "}
              {/* Box for instructions */}
              <h4 className="font-semibold">Export Instructions:</h4>
              <p className="text-sm text-muted-foreground">
                Click the button below to download a CSV file containing all your subscribers
                (email, name, status, tags, creation date).
              </p>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Export Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* Ensure footer is within the TabsContent */}
            <DialogFooter className="pt-4">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {exporting ? "Exporting..." : "Download CSV Export"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

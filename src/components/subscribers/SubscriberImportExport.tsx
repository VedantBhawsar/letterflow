import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

type SubscriberImportExportProps = {
  className?: string;
  onComplete?: () => void;
};

export function SubscriberImportExport({ className, onComplete }: SubscriberImportExportProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("import");
  const [csvData, setCsvData] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleImport = async () => {
    if (!csvData.trim()) {
      setError("Please enter CSV data");
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setImportResult(null);

      // Parse CSV data
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const emailIndex = headers.indexOf("email");
      const firstNameIndex =
        headers.indexOf("firstname") !== -1
          ? headers.indexOf("firstname")
          : headers.indexOf("first_name");
      const lastNameIndex =
        headers.indexOf("lastname") !== -1
          ? headers.indexOf("lastname")
          : headers.indexOf("last_name");
      const tagsIndex = headers.indexOf("tags");
      const statusIndex = headers.indexOf("status");

      if (emailIndex === -1) {
        setError("CSV must contain an 'email' column");
        return;
      }

      const subscribers = [];

      // Start from index 1 to skip the header row
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(",").map((v) => v.trim());

        const subscriber: any = {
          email: values[emailIndex],
        };

        if (firstNameIndex !== -1 && values[firstNameIndex]) {
          subscriber.firstName = values[firstNameIndex];
        }

        if (lastNameIndex !== -1 && values[lastNameIndex]) {
          subscriber.lastName = values[lastNameIndex];
        }

        if (tagsIndex !== -1 && values[tagsIndex]) {
          subscriber.tags = values[tagsIndex].split(";").map((t) => t.trim());
        }

        if (statusIndex !== -1 && values[statusIndex]) {
          const status = values[statusIndex].toLowerCase();
          if (["active", "unsubscribed", "bounced"].includes(status)) {
            subscriber.status = status;
          }
        }

        subscribers.push(subscriber);
      }

      // Send to API
      const response = await fetch("/api/subscribers/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscribers }),
      });

      if (!response.ok) {
        throw new Error("Failed to import subscribers");
      }

      const result = await response.json();
      setImportResult(result);

      if (result.imported > 0) {
        toast({
          title: "Import successful",
          description: `${result.imported} subscribers imported, ${result.skipped} skipped, ${result.failed} failed`,
        });

        // Reset form if successful
        setCsvData("");

        // Notify parent component
        if (onComplete) {
          onComplete();
        }
      } else {
        toast({
          title: "Import completed",
          description: "No subscribers were imported. Check the results for details.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error importing subscribers:", err);
      setError(err instanceof Error ? err.message : "Failed to import subscribers");
      toast({
        title: "Import failed",
        description: "There was an error importing your subscribers.",
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

      const response = await fetch("/api/subscribers/bulk");

      if (!response.ok) {
        throw new Error("Failed to export subscribers");
      }

      const data = await response.json();

      if (!data.subscribers?.length) {
        toast({
          title: "No subscribers",
          description: "There are no subscribers to export.",
        });
        return;
      }

      // Convert to CSV
      const headers = ["email", "firstName", "lastName", "status", "tags", "createdAt"];
      const csv = [
        headers.join(","),
        ...data.subscribers.map((sub: any) => {
          return [
            sub.email,
            sub.firstName || "",
            sub.lastName || "",
            sub.status,
            sub.tags?.join(";") || "",
            new Date(sub.createdAt).toISOString().split("T")[0],
          ].join(",");
        }),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `${data.subscribers.length} subscribers exported to CSV`,
      });

      setOpen(false);
    } catch (err) {
      console.error("Error exporting subscribers:", err);
      setError(err instanceof Error ? err.message : "Failed to export subscribers");
      toast({
        title: "Export failed",
        description: "There was an error exporting your subscribers.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={cn("flex flex-col gap-2", className)}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import/Export
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Subscribers</DialogTitle>
          <DialogDescription>Import new subscribers or export your current list</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Import subscribers from CSV. The file must have an &apos;email&apos; column.
                Optional columns: firstName, lastName, tags (separated by semicolons), status.
              </p>

              <p className="text-sm font-medium">Example format:</p>
              <code className="text-xs bg-muted p-2 rounded block">
                email,firstName,lastName,tags,status
                <br />
                john@example.com,John,Doe,newsletter;early-adopter,active
                <br />
                jane@example.com,Jane,Smith,newsletter,active
              </code>
            </div>

            <Textarea
              placeholder="Paste your CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {importResult && (
              <Alert variant={importResult.imported > 0 ? "default" : "destructive"}>
                <AlertTitle>Import Results</AlertTitle>
                <AlertDescription>
                  <p>Subscribers imported: {importResult.imported}</p>
                  <p>Subscribers skipped: {importResult.skipped}</p>
                  <p>Failed entries: {importResult.failed}</p>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importing || !csvData.trim()}>
                {importing && <Spinner size="sm" className="mr-2" />}
                Import Subscribers
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Export your current subscribers to a CSV file. This will include all subscriber
                information including email, name, status, and tags.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Subscribers
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

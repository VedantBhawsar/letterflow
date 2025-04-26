"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImportExportProps {
  onComplete?: () => void;
}

export function ImportExport({ onComplete }: ImportExportProps) {
  const router = useRouter();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: { total: number; created: number; skipped: number; errors: string[] };
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setResult({
        success: false,
        message: "Please select a file to import",
      });
      return;
    }

    setLoading(true);
    setProgress(10);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/subscribers/import", {
        method: "POST",
        body: formData,
      });

      setProgress(90);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import subscribers");
      }

      const data = await response.json();
      setProgress(100);

      setResult({
        success: true,
        message: "Import completed successfully",
        details: data,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error importing subscribers:", error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to import subscribers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Open export link in a new tab
      window.open("/api/subscribers/export", "_blank");
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      alert("Failed to export subscribers");
    }
  };

  return (
    <div className="flex space-x-2">
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Subscribers</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleImport} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload CSV or Excel File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                The file should contain at minimum an email column. Other optional columns:
                firstName, lastName, status, tags
              </p>
            </div>

            {loading && (
              <div className="space-y-2">
                <Label>Importing...</Label>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.message}
                  {result.details && (
                    <ul className="mt-2 text-sm">
                      <li>Total subscribers: {result.details.total}</li>
                      <li>Successfully imported: {result.details.created}</li>
                      <li>Skipped (duplicates): {result.details.skipped}</li>
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!file || loading}>
                {loading ? "Importing..." : "Import Subscribers"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
}

import { Toaster } from "sonner";

export default function NewsletterEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 h-full">{children}</main>
      <Toaster position="top-right" />
    </div>
  );
}

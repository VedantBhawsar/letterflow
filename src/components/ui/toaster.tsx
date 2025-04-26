import { useToast } from "@/components/ui/use-toast";

type ToastAction = {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      aria-live="assertive"
    >
      {toasts.map(({ id, title, description, variant, action }) => (
        <div
          key={id}
          className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full mb-2 ${
            variant === "destructive"
              ? "destructive bg-destructive text-destructive-foreground"
              : "bg-background"
          }`}
        >
          <div className="grid gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

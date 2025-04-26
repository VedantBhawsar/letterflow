"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SegmentBuilder } from "@/components/subscribers/segment-builder";

export default function CreateSegmentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCancel = () => {
    router.push("/dashboard/subscribers?tab=segments");
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/subscribers?tab=segments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Segment</h1>
      </div>

      <SegmentBuilder onCancel={handleCancel} />
    </div>
  );
}

"use client";

import React from "react";
import { Campaign } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Eye,
  Mail,
  MousePointer,
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import axios from "axios";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

interface CampaignsTableProps {
  campaigns: Campaign[];
  onSort: (key: string) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  sortConfig: {
    key: string;
    direction: "asc" | "desc";
  };
}

const CampaignsTable = React.memo(({ campaigns, onSort, sortConfig }: CampaignsTableProps) => {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const handleDelete = async (campaingId: string) => {
    await axios.delete(`/api/campaigns/${campaingId}`);
    toast.success("Campaigns delete successfully");
  };

  return (
    <Card>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50 transition-colors">
                <th
                  onClick={() => onSort("name")}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                >
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUpDown
                      className={`h-4 w-4 ${sortConfig.key === "name" ? "text-primary" : ""}`}
                    />
                  </div>
                </th>
                <th
                  onClick={() => onSort("createdAt")}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/80"
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date
                    <ArrowUpDown
                      className={`h-4 w-4 ${sortConfig.key === "createdAt" ? "text-primary" : ""}`}
                    />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Recipients
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Opens
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    Clicks
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 w-[50px] px-4"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign: any) => (
                <AnimatePresence key={campaign.id}>
                  <motion.tr
                    exit={{
                      scale: 0.8,
                    }}
                    transition={{
                      ease: "linear",
                    }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      <div>
                        <Link href={`/dashboard/campaigns/${campaign.id}`}>{campaign.name}</Link>
                        <div className="text-xs text-muted-foreground">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {campaign.status === "sent"
                        ? formatDate(campaign.sentAt)
                        : campaign.status === "scheduled"
                          ? formatDate(campaign.scheduledAt)
                          : formatDate(campaign.createdAt)}
                    </td>
                    <td className="p-4 align-middle">{campaign.audienceIds.length}</td>
                    <td className="p-4 align-middle">
                      {campaign.status === "sent" && campaign.stats
                        ? `${campaign.stats.opened} (${Math.round(
                            (campaign.stats.opened / (campaign.stats.sent || 1)) * 100
                          )}%)`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {campaign.status === "sent" && campaign.stats
                        ? `${campaign.stats.clicked} (${Math.round(
                            (campaign.stats.clicked / (campaign.stats.opened || 1)) * 100
                          )}%)`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          campaign.status === "sent"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : campaign.status === "draft"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                              : campaign.status === "scheduled"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </div>
                    </td>
                    <td className="p-4 align-super">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                              <Edit /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(campaign.id)}
                          >
                            <Trash /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                </AnimatePresence>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
});

CampaignsTable.displayName = "CampaignsTable";

export function CampaignsTableSkeleton() {
  return (
    <Card>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50 transition-colors">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Recipients
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Opens
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    Clicks
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 w-[50px] px-4"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_: any, index: any) => (
                <tr key={index} className="border-b transition-colors">
                  <td className="p-4 align-middle">
                    <div>
                      <Skeleton className="h-5 w-36 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-5 w-10" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="p-4 align-middle">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

export { CampaignsTable };

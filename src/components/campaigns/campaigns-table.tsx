"use client";

import React from "react";
import { Campaign } from "@/lib/types";
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
  isLoading?: boolean;
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
    <Card className="bg-slate-800 border-slate-700 text-white">
      <div className="rounded-md border border-slate-700">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50 transition-colors">
                <th
                  onClick={() => onSort("name")}
                  className="h-12 px-4 text-left align-middle font-medium text-slate-300 cursor-pointer hover:bg-slate-800"
                >
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUpDown
                      className={`h-4 w-4 ${sortConfig.key === "name" ? "text-emerald-400" : ""}`}
                    />
                  </div>
                </th>
                <th
                  onClick={() => onSort("createdAt")}
                  className="h-12 px-4 text-left align-middle font-medium text-slate-300 cursor-pointer hover:bg-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date
                    <ArrowUpDown
                      className={`h-4 w-4 ${sortConfig.key === "createdAt" ? "text-emerald-400" : ""}`}
                    />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Recipients
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Opens
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    Clicks
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
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
                    className="border-b border-slate-700 transition-colors hover:bg-slate-700/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      <div>
                        <Link
                          href={`/dashboard/campaigns/${campaign.id}`}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          {campaign.name}
                        </Link>
                        <div className="text-xs text-slate-400">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-slate-300">
                      {campaign.status === "sent"
                        ? formatDate(campaign.sentAt)
                        : campaign.status === "scheduled"
                          ? formatDate(campaign.scheduledAt)
                          : formatDate(campaign.createdAt)}
                    </td>
                    <td className="p-4 align-middle text-slate-300">
                      {campaign.audienceIds.length}
                    </td>
                    <td className="p-4 align-middle text-slate-300">
                      {campaign.status === "sent" && campaign.stats
                        ? `${campaign.stats.opened} (${Math.round(
                            (campaign.stats.opened / (campaign.stats.sent || 1)) * 100
                          )}%)`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle text-slate-300">
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
                            ? "bg-green-900/20 text-green-400"
                            : campaign.status === "draft"
                              ? "bg-slate-800/40 text-slate-300"
                              : campaign.status === "scheduled"
                                ? "bg-emerald-900/20 text-emerald-400"
                                : "bg-amber-900/20 text-amber-400"
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </div>
                    </td>
                    <td className="p-4 align-super">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="text-slate-300 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                          <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                            <Link
                              href={`/dashboard/campaigns/${campaign.id}/edit`}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
                            onClick={() => handleDelete(campaign.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" /> Delete
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
    <Card className="bg-slate-800 border-slate-700 text-white">
      <div className="rounded-md border border-slate-700">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50 transition-colors">
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Recipients
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Opens
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
                  <div className="flex items-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    Clicks
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-300">
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

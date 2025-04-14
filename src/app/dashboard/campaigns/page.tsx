"use client";

import { useState } from "react";
import {
  PlusCircle,
  Search,
  Mail,
  Eye,
  MousePointer,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Sample campaign data
const campaigns = [
  {
    id: 1,
    name: "Weekly Newsletter #32",
    subject: "Latest Updates and Featured Content",
    date: "2023-10-15",
    status: "Sent",
    opens: 264,
    clicks: 82,
    recipients: 1000,
  },
  {
    id: 2,
    name: "Product Update",
    subject: "New Features Released",
    date: "2023-10-08",
    status: "Sent",
    opens: 321,
    clicks: 145,
    recipients: 1000,
  },
  {
    id: 3,
    name: "Feature Announcement",
    subject: "Introducing Our Latest Feature",
    date: "2023-10-01",
    status: "Sent",
    opens: 287,
    clicks: 96,
    recipients: 1000,
  },
  {
    id: 4,
    name: "Upcoming Webinar",
    subject: "Join Our Exclusive Webinar",
    date: "2023-10-22",
    status: "Draft",
    opens: 0,
    clicks: 0,
    recipients: 0,
  },
  {
    id: 5,
    name: "Black Friday Sale",
    subject: "Special Offers Inside",
    date: "2023-11-24",
    status: "Scheduled",
    opens: 0,
    clicks: 0,
    recipients: 1200,
  },
];

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your email campaigns
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/50 transition-colors">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
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
                {filteredCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      <div>
                        <div>{campaign.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {campaign.subject}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {new Date(campaign.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">{campaign.recipients}</td>
                    <td className="p-4 align-middle">
                      {campaign.status === "Sent"
                        ? `${campaign.opens} (${Math.round(
                            (campaign.opens / campaign.recipients) * 100
                          )}%)`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {campaign.status === "Sent"
                        ? `${campaign.clicks} (${Math.round(
                            (campaign.clicks / campaign.recipients) * 100
                          )}%)`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          campaign.status === "Sent"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : campaign.status === "Draft"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                        }`}
                      >
                        {campaign.status}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  PlusCircle,
  Search,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Sample subscriber data
const subscribers = [
  {
    id: 1,
    email: "john.doe@example.com",
    name: "John Doe",
    status: "Active",
    subscribed: "2023-09-15",
    source: "Landing Page",
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    name: "Jane Smith",
    status: "Active",
    subscribed: "2023-09-18",
    source: "Referral",
  },
  {
    id: 3,
    email: "michael.brown@example.com",
    name: "Michael Brown",
    status: "Active",
    subscribed: "2023-09-20",
    source: "Social Media",
  },
  {
    id: 4,
    email: "emily.wilson@example.com",
    name: "Emily Wilson",
    status: "Unsubscribed",
    subscribed: "2023-08-05",
    source: "Webinar",
  },
  {
    id: 5,
    email: "david.miller@example.com",
    name: "David Miller",
    status: "Active",
    subscribed: "2023-09-25",
    source: "Landing Page",
  },
  {
    id: 6,
    email: "sarah.jackson@example.com",
    name: "Sarah Jackson",
    status: "Bounced",
    subscribed: "2023-09-10",
    source: "Social Media",
  },
  {
    id: 7,
    email: "william.taylor@example.com",
    name: "William Taylor",
    status: "Active",
    subscribed: "2023-09-28",
    source: "Referral",
  },
];

export default function SubscribersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-muted-foreground">
            Manage your newsletter subscribers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subscriber
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/50 transition-colors">
                  <th className="h-12 w-[60px] px-4 text-left align-middle font-medium text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name / Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Subscribed On
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="h-12 w-[50px] px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4 align-middle font-medium">
                      <div>
                        <div>{subscriber.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {subscriber.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        {subscriber.status === "Active" ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            <span>Active</span>
                          </>
                        ) : subscriber.status === "Unsubscribed" ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                            <span>Unsubscribed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            <span>Bounced</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {new Date(subscriber.subscribed).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">{subscriber.source}</td>
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
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredSubscribers.length}</strong> of{" "}
            <strong>{subscribers.length}</strong> subscribers
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

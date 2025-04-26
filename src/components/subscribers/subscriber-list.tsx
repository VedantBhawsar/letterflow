"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal as DotsHorizontalIcon, Search as SearchIcon } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  tags: string[];
  createdAt: string;
}

interface SubscriberListProps {
  status: string | null;
  segmentId?: string;
  refreshKey?: number;
}

export function SubscriberList({ status, segmentId, refreshKey = 0 }: SubscriberListProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (segmentId) params.append("segmentId", segmentId);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/subscribers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }

      const data = await response.json();
      setSubscribers(data.subscribers);
      setTotalPages(data.pagination.pages);
      setTotalSubscribers(data.pagination.total);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [status, segmentId, currentPage, refreshKey]);

  useEffect(() => {
    const timeout = setTimeout(fetchSubscribers, 3000)
    return () => clearTimeout(timeout)
  }, [searchTerm])
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubscribers();
  };

  const handleEdit = (subscriber: Subscriber) => {
    router.push(`/dashboard/subscribers/${subscriber.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "unsubscribed":
        return <Badge variant="outline">Unsubscribed</Badge>;
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>;
      case "complained":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Complained</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search email or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" size="icon" variant="outline">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-sm text-muted-foreground">{totalSubscribers} subscribers found</div>
      </div>

      {loading ? <LoadingTable /> : subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <h3 className="text-lg font-semibold">No subscribers found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.firstName || subscriber.lastName
                        ? `${subscriber.firstName || ""} ${subscriber.lastName || ""}`
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {subscriber.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        {subscriber.tags.length > 3 && (
                          <Badge variant="outline">+{subscriber.tags.length - 3}</Badge>
                        )}
                        {subscriber.tags.length === 0 && "-"}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(subscriber.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(subscriber)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Activity</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}

function LoadingTable() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
          <Skeleton className="h-6 w-full max-w-[150px]" />
          <Skeleton className="h-6 w-full max-w-[100px]" />
          <Skeleton className="h-6 w-full max-w-[80px]" />
        </div>
      ))}
    </div>
  )
}

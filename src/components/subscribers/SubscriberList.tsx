import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";

type Subscriber = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type SubscriberListProps = {
  onEdit: (subscriber: Subscriber) => void;
  onDelete: (subscriberId: string) => void;
  onSelect?: (subscribers: Subscriber[]) => void;
  refreshTrigger?: number;
};

export function SubscriberList({
  onEdit,
  onDelete,
  onSelect,
  refreshTrigger = 0,
}: SubscriberListProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/subscribers";
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch subscribers");
      }

      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers, refreshTrigger]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const toggleSelect = (subscriberId: string) => {
    setSelectedSubscribers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(subscriberId)) {
        newSelected.delete(subscriberId);
      } else {
        newSelected.add(subscriberId);
      }

      // Notify parent about selection changes if callback provided
      if (onSelect) {
        const selectedSubscriberObjects = subscribers.filter((sub: any) => newSelected.has(sub.id));
        onSelect(selectedSubscriberObjects);
      }

      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    setSelectedSubscribers((prev) => {
      const newSelected = new Set<string>();

      // If not all are selected, select all
      if (prev.size !== subscribers.length) {
        subscribers.forEach((subscriber) => {
          newSelected.add(subscriber.id);
        });
      }

      // Notify parent about selection changes if callback provided
      if (onSelect) {
        const selectedSubscriberObjects = subscribers.filter((sub: any) => newSelected.has(sub.id));
        onSelect(selectedSubscriberObjects);
      }

      return newSelected;
    });
  };

  const formatName = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return "—";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "unsubscribed":
        return "bg-yellow-100 text-yellow-800";
      case "bounced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CardTitle>Subscribers</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-[240px]"
            />
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="max-w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>Manage your email subscribers</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No subscribers found</div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        selectedSubscribers.size === subscribers.length && subscribers.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all subscribers"
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Subscribed On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber: any) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubscribers.has(subscriber.id)}
                        onCheckedChange={() => toggleSelect(subscriber.id)}
                        aria-label={`Select subscriber ${subscriber.email}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>{formatName(subscriber.firstName, subscriber.lastName)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(subscriber.status)}>
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscriber.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {subscriber.tags.slice(0, 2).map((tag: any) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                          {subscriber.tags.length > 2 && (
                            <Badge variant="outline">+{subscriber.tags.length - 2}</Badge>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(subscriber)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => onDelete(subscriber.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

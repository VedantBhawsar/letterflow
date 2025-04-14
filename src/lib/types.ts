export interface Campaign {
  id: string;
  userId: string;
  name: string;
  subject: string;
  content: string;
  status: "draft" | "scheduled" | "sent" | "archived";
  sentAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  stats?: CampaignStats;
  audienceIds: string[];
}

export interface Subscriber {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: "active" | "unsubscribed" | "bounced";
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  campaignIds: string[];
}

export interface CampaignStats {
  id: string;
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  complaints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: string;
  userId: string;
  name: string;
  content: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardOverview {
  totalSubscribers: number;
  activeSubscribers: number;
  campaignsCount: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export interface SubscriberGrowthData {
  date: Date;
  count: number;
}

export interface AnalyticsResponse {
  overview: DashboardOverview;
  recentCampaigns: Campaign[];
  subscriberGrowth: SubscriberGrowthData[];
}

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
  metadata?: Record<string, null>;
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

// Newsletter types
export interface SocialLink {
  platform: string;
  url: string;
}

export interface NewsletterElement {
  id: string;
  type: string;
  content?: string;
  src?: string;
  url?: string;
  alt?: string;
  style?: React.CSSProperties;
  columns?: NewsletterElement[][];
  personalizedFields?: { fieldName: string; defaultValue: string }[];
  height?: string;
  socialLinks?: SocialLink[];
}

export interface Newsletter {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published";
  template: string;
  elements: NewsletterElement[];
  userId: string;
}

export interface NewsletterTemplate {
  name: string;
  elements: NewsletterElement[];
}

// Subscription Form types
export type FormFieldType = "text" | "email" | "number" | "checkbox" | "select";

export type FormField = {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

export type FormSettings = {
  submitButtonText: string;
  successMessage: string;
  doubleOptIn: boolean;
  redirectUrl?: string;
  honeypotEnabled: boolean;
  recaptchaEnabled: boolean;
  recaptchaSiteKey?: string;
};

export type FormStyle = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: "filled" | "outline" | "minimal";
};

export type SubscriptionForm = {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  style: FormStyle;
  status: "active" | "inactive" | "archived";
  formKey: string;
  views: number;
  submissions: number;
  conversionRate?: number;
  traffic?: Record<string, number>;
  createdAt: string | Date;
  updatedAt: string | Date;
};

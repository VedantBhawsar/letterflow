"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Key, Mail, CreditCard, LogOut, Copy } from "lucide-react";
import { format } from "date-fns";

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  company: z.string().optional(),
  website: z.string().optional(),
});

// Password form schema
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    newPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
  expiresAt?: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [profileSaved, setProfileSaved] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      company: "",
      website: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchApiKeys = async () => {
      const res = await fetch("/api/api-keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      } else {
        console.error("Failed to fetch API keys");
      }
    };

    if (session) {
      fetchApiKeys();
    }
  }, [session]);

  function onProfileSubmit(data: ProfileFormData) {
    console.log("Profile form submitted:", data);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  function onPasswordSubmit(data: PasswordFormData) {
    console.log("Password form submitted:", data);
    passwordForm.reset();
  }

  const handleGenerateApiKey = async () => {
    const res = await fetch("/api/api-keys", {
      method: "POST",
    });

    if (res.ok) {
      const newKey = await res.json();
      setGeneratedApiKey(newKey.key);
      const fetchRes = await fetch("/api/api-keys");
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setApiKeys(data);
      }
    } else {
      console.error("Failed to generate API key");
      setGeneratedApiKey(null);
    }
  };

  const handleRevokeApiKey = async (apiKeyId: string) => {
    const res = await fetch(`/api/api-keys?id=${apiKeyId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setApiKeys(apiKeys.filter((key) => key.id !== apiKeyId));
    } else {
      console.error("Failed to revoke API key");
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("API key copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy API key:", err);
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-fit" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-fit" />
            <span className="hidden sm:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-fit" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-fit" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-fit" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Profile Settings</h3>
              <p className="text-sm text-muted-foreground">
                Update your personal information and public profile
              </p>
            </div>

            {profileSaved && (
              <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Your profile has been successfully updated!
              </div>
            )}

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Optional: Your company or organization</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://" />
                        </FormControl>
                        <FormDescription>
                          Optional: Your personal or company website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Password Settings */}
        <TabsContent value="password" className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>

            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure how and when you receive notifications
              </p>
            </div>
            <div className="flex items-center justify-center h-48 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">Notification settings coming soon</p>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Billing Information</h3>
              <p className="text-sm text-muted-foreground">
                Manage your subscription and payment methods
              </p>
            </div>
            <div className="flex items-center justify-center h-48 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">Billing settings coming soon</p>
            </div>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="mt-6">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">API Access</h3>
              <p className="text-sm text-muted-foreground">
                Manage your API keys and access tokens
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Your API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and manage your API keys for accessing the Letterflow API.
                </p>
              </div>

              {/* Generate New API Key */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-md font-medium">Generate New Key</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate a new API key for your account.
                  </p>
                </div>
                <Button onClick={handleGenerateApiKey}>Generate Key</Button>
              </div>

              {generatedApiKey && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium">Generated API Key</h4>
                  <div className="flex items-center space-x-2">
                    <Input type="text" value={generatedApiKey} readOnly />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(generatedApiKey)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep your API key secure and do not share it.
                  </p>
                </div>
              )}

              {apiKeys.length > 0 ? (
                <div>
                  <h4 className="text-md font-medium">Existing API Keys</h4>
                  <div className="border rounded-md p-4">
                    {apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <div className="flex-1 mr-4">
                          <p className="font-mono text-sm truncate">{apiKey.key}</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {format(new Date(apiKey.createdAt), "PPP")}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-md font-medium">Existing API Keys</h4>
                  <div className="border rounded-md p-4">
                    <p className="text-muted-foreground">No API keys found.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 border-red-200 dark:border-red-900/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all of your data
            </p>
          </div>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
}

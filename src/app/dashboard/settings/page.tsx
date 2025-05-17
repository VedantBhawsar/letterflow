"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  User,
  Bell,
  Key,
  Mail,
  CreditCard,
  Check,
  AlertTriangle,
  ChevronDown,
  MapPin,
  Phone,
  Home,
  Building,
  IndianRupee,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  location: z.string().optional(),
  currency: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
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

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

// Get Cloudinary configuration from environment variables
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "letterflow_preset";

// Indian states for dropdown
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profileImage, setProfileImage] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showStatesDropdown, setShowStatesDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreference[]>([
    {
      id: "order-confirmation",
      title: "Order Confirmation",
      description: "You will be notified when customer places an order.",
      enabled: true,
    },
    {
      id: "order-status-changed",
      title: "Order Status Changed",
      description: "You will be notified when customer make changes to the order.",
      enabled: true,
    },
    {
      id: "order-delivered",
      title: "Order Delivered",
      description: "You will be notified when the order is delivered.",
      enabled: true,
    },
    {
      id: "email-notification",
      title: "Email Notification",
      description: "You will get email notification to get updates through email.",
      enabled: true,
    },
  ]);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      location: "Mumbai, Maharashtra",
      currency: "Indian Rupee (₹)",
      email: session?.user?.email || "",
      phone: "9876543210",
      address: "123 Main Street, Mumbai, Maharashtra, 400001, India",
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

  // Create locations dropdown ref to handle outside clicks
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const statesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.image) {
      setProfileImage(session.user.image);
    }

    // Update form values if session changes
    if (session?.user) {
      profileForm.setValue("name", session.user.name || "");
      profileForm.setValue("email", session.user.email || "");
    }
  }, [session, profileForm]);

  // Debug Cloudinary configuration
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Cloudinary upload preset:", UPLOAD_PRESET);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (statesDropdownRef.current && !statesDropdownRef.current.contains(event.target as Node)) {
        setShowStatesDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function onProfileSubmit(data: ProfileFormData) {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          image: profileImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          email: data.email,
          image: profileImage,
        },
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  }

  async function onPasswordSubmit(data: PasswordFormData) {
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
      console.error("Error changing password:", error);
    }
  }

  const handleNotificationToggle = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, enabled: !notification.enabled } : notification
      )
    );
  };

  const handleImageUpload = (result: any) => {
    setProfileImage(result.info.secure_url);
    toast.success("Profile image uploaded successfully");
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-300">Settings</h1>
        <p className="text-slate-400">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-slate-800 border-slate-700/50 shadow-lg shadow-emerald-900/5">
            <h2 className="text-lg font-semibold mb-6 text-slate-300">Edit Profile</h2>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                {/* Profile image upload */}
                <div className="mb-6 flex flex-col items-center sm:items-start">
                  <div className="mb-2">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-500/10 text-xl font-medium text-emerald-500">
                          {session?.user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                  <CldUploadWidget
                    uploadPreset={UPLOAD_PRESET}
                    options={{
                      maxFiles: 1,
                      resourceType: "image",
                      sources: ["local", "url", "camera"],
                      clientAllowedFormats: ["jpg", "png", "jpeg", "gif"],
                      maxFileSize: 2000000,
                      multiple: false,
                      showAdvancedOptions: false,
                      singleUploadAutoClose: true,
                    }}
                    onSuccess={handleImageUpload}
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => open()}
                        className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                      >
                        Change Avatar
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>

                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Your Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            placeholder="Your full name"
                            className="pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Location</FormLabel>
                      <FormControl>
                        <div className="relative" ref={statesDropdownRef}>
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <div className="relative">
                            <Input
                              placeholder="Your location"
                              value={field.value}
                              onChange={field.onChange}
                              onClick={() => setShowStatesDropdown(!showStatesDropdown)}
                              className="cursor-pointer pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                            />
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                          </div>

                          {showStatesDropdown && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-900 py-1 shadow-lg">
                              {INDIAN_STATES.map((state) => (
                                <div
                                  key={state}
                                  className="px-2 py-1.5 text-sm hover:bg-slate-800 cursor-pointer text-slate-300"
                                  onClick={() => {
                                    field.onChange(state);
                                    setShowStatesDropdown(false);
                                  }}
                                >
                                  {state}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Currency</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            placeholder="Your preferred currency"
                            {...field}
                            readOnly
                            value="Indian Rupee (₹)"
                            className="cursor-not-allowed pl-10 bg-slate-900 border-slate-700 text-slate-300"
                          />
                          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            type="email"
                            placeholder="Your email address"
                            className="pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            placeholder="Your phone number"
                            className="pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Home className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input
                            placeholder="Your address"
                            className="pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-slate-800 border-slate-700/50 shadow-lg shadow-emerald-900/5">
              <h2 className="text-lg font-semibold mb-6 text-slate-300">Change Password</h2>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                              type="password"
                              placeholder="••••••••••"
                              className="pl-10 bg-slate-900 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20 text-slate-300"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-slate-800 border-slate-700/50 shadow-lg shadow-emerald-900/5">
              <h2 className="text-lg font-semibold mb-6 text-slate-300">Notifications</h2>
              <div className="space-y-5">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between py-1">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-slate-300">{notification.title}</h3>
                      <p className="text-sm text-slate-400">{notification.description}</p>
                    </div>
                    <Switch
                      checked={notification.enabled}
                      onCheckedChange={() => handleNotificationToggle(notification.id)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

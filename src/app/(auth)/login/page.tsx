// pages/login.tsx OR app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    remember: z.boolean(),
  })
  .required();

type LoginFormValues = z.infer<typeof loginSchema>;
// LoginFormValues is { email: string; password: string; remember: boolean }

import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const registered = searchParams.get("registered");

  useEffect(() => {
    if (registered === "true") {
      toast.success("Registration successful! Please log in with your new account.");
    }
  }, [registered]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@gmail.com",
      password: "q#JS_.~)kmJ7VDc",
      remember: false,
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password");
          toast.error("Invalid email or password");
        } else {
          setError(`Login failed: ${result.error}`);
          toast.error(`Login failed: ${result.error}`);
        }
        return;
      }

      if (result?.ok && !result?.error) {
        toast.success("Login successful!");
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl);
      } else {
        setError("An unexpected error occurred during login.");
        toast.error("An unexpected error occurred during login.");
      }
    } catch (error: Error | unknown) {
      console.error("Login submit error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Left side - Background and text */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-10 relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-emerald-400 mr-2"
            >
              <path d="M6.8 22 12 19l5.2 3V7.8l-5.2-3-5.2 3Z" />
              <path d="m19 7.8 2-1.2V18l-2.2 1.2" />
              <path d="M5 7.8 3 6.6V18l2 1.2" />
              <path d="m12 10.5-5-3" />
              <path d="m17 7.5-5 3" />
              <path d="M12 13v6" />
            </svg>
            <Link href="/" className="text-xl font-bold text-white">
              LetterFlow
            </Link>
          </div>

          {/* Main content */}
          <div className="flex-grow flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-sm font-semibold mb-2 text-emerald-400">WELCOME BACK</div>
              <h1 className="text-4xl font-bold mb-4 text-white">
                Access your
                <div>
                  <span className="text-emerald-400">newsletters</span>
                </div>
                <div>and subscriber data</div>
              </h1>
              <p className="text-sm text-slate-300 mb-8 max-w-sm">
                Log in to manage your campaigns, view analytics, and send engaging newsletters to
                your growing audience.
              </p>
            </motion.div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                View documentation
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Try demo</Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Login form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 bg-slate-900 flex items-center justify-center p-6"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-1">
              Welcome
              <span className="text-emerald-400"> back</span>
              <span className="text-emerald-400">.</span>
            </h2>
            <p className="text-slate-300 text-sm">
              Please sign in to access your newsletter dashboard
            </p>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-red-900/30 p-4 border border-red-700/50"
                >
                  <div className="text-sm text-red-400">{error}</div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Email address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-300"
                            onClick={togglePasswordVisibility}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                <line x1="2" x2="22" y1="2" y2="22" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex items-center justify-between"
              >
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          className="border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20 rounded"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-slate-300 cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-emerald-400 hover:text-emerald-300">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}

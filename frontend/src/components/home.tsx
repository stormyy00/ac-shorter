"use client";

import React, { useState } from "react";
import {
  Copy,
  ExternalLink,
  Trash2,
  Eye,
  Plus,
  RefreshCcwDot,
  LinkIcon,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getLinks, createLink, deleteLink, verifyUser } from "./actions";
import { links } from "@/types";
import Link from "next/link";

export default function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customShort, setCustomShort] = useState("");
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { data: data } = useQuery({
    queryKey: ["user"],
    queryFn: async () => verifyUser(),
  });

  const { data: shortenedUrls = [], refetch } = useQuery({
    queryKey: ["links"],
    queryFn: async () => getLinks("recent"),
  }) as {
    data: links[];
    refetch: () => void;
    isFetching: boolean;
    isPending: boolean;
  };

  const showAlert = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async () => {
    if (data?.status !== "success") {
      showAlert("Please sign in to create a short link", "error");
      return;
    }

    if (!originalUrl) {
      showAlert("Please enter a valid URL", "error");
      return;
    }
    await createLink(originalUrl, customShort);
    showAlert("URL shortened successfully!");
    setOriginalUrl("");
    setCustomShort("");
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteLink(id);
    showAlert("Link deleted successfully!");
    refetch();
  };

  const copyToClipboard = async (shortUrl: string) => {
    await navigator.clipboard.writeText(shortUrl);
    showAlert("Link copied to clipboard!");
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    if (typeof url !== "string") return "";
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6 pt-12">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="w-3 h-3 mr-1" />
                  Fast Reliable Secure
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                  Shorten URLs
                  <span className="text-blue-600 block">Made Simple</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Transform your long, complex URLs into clean, shareable links
                  in seconds. Track clicks, customize your links, and manage
                  everything from one dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {data?.status !== "success" ? (
                  <Button size="lg" className="px-8">
                    <>Get Creating</>
                  </Button>
                ) : null}
                <Button variant="outline" size="lg" className="px-8">
                  <Link href="dashboard/statistics">View Analytics</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {alert && (
              <Alert
                className={
                  alert.type === "error"
                    ? "border-red-500 bg-red-50"
                    : "border-green-500 bg-green-50"
                }
              >
                <AlertDescription
                  className={
                    alert.type === "error" ? "text-red-700" : "text-green-700"
                  }
                >
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-2 md:mt-[8vh]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Short Link
                </CardTitle>
                <CardDescription>
                  Enter a URL and get a short link instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original-url">Website URL *</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="original-url"
                      type="url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="https://example.com/very-long-url"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-short">
                    Custom Short URL (optional)
                  </Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      short.ly/
                    </span>
                    <Input
                      id="custom-short"
                      type="text"
                      value={customShort}
                      onChange={(e) => setCustomShort(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="custom-name"
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Shorten URL
                </Button>
              </CardContent>
            </Card>
            {shortenedUrls.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm w-full max-w-lg mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">Your Links</CardTitle>
                      <CardDescription>
                        {shortenedUrls.length} links created
                      </CardDescription>
                    </div>
                    <RefreshCcwDot
                      onClick={() => refetch()}
                      className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shortenedUrls
                      .slice(0, 3)
                      .map(({ id, original, shortenUrl, clicks }, index) => (
                        <div key={id}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group gap-2">
                            <div className="flex items-center space-x-3 min-w-0 flex-1 w-full">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <LinkIcon className="w-3 h-3 text-primary" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-medium text-primary text-sm truncate max-w-[175px] sm:max-w-md">
                                    {shortenUrl}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="flex items-center space-x-1 text-xs"
                                  >
                                    <Eye className="w-2 h-2" />
                                    <span>{clicks}</span>
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate max-w-[175px] sm:max-w-md">
                                  {truncateUrl(original)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(shortenUrl)}
                                className="h-8 w-8 p-0 hover:bg-gray-200"
                                aria-label="Copy link"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-200"
                                aria-label="Open link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                aria-label="Delete link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {index < Math.min(shortenedUrls.length, 3) - 1 && (
                            <Separator className="my-2" />
                          )}
                        </div>
                      ))}
                    {shortenedUrls.length > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        View All Links ({shortenedUrls.length})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

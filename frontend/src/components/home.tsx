"use client";

import React, { useState } from "react";
import {
  Copy,
  Link as LinkIcon,
  ExternalLink,
  Trash2,
  Eye,
  Plus,
  RefreshCcwDot,
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
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { data: data } = useQuery({
    queryKey: ["user"],
    queryFn: async () => verifyUser(),
    refetchOnWindowFocus: false,
    retry: false,
  })

  const {
    data: shortenedUrls = [],
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["links"],
    queryFn: async () => getLinks("recent"),
  }) as {
    data: links[];
    refetch: () => void;
    isFetching: boolean;
  };

  const showAlert = (message: string, type: "success" | "error" = "success") => {
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
    <div className="min-h-screen p-4 w-full">
      <div className="max-w-3xl mx-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold tracking-tight">
              URL Shortener
            </div>
            <p className="text-muted-foreground text-lg">
              Transform long URLs into short, shareable links
            </p>
            <RefreshCcwDot
              onClick={() => refetch()}
              className={isFetching ? "animate-spin" : ""}
            />
          </div>

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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Short Link
              </CardTitle>
              <CardDescription>
                Enter a long URL and optionally customize your short link
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
                <div className="space-y-2 ">
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
              </div>
              <Button onClick={handleSubmit} className="rounded-lg" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Shorten URL
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Shortened Links</CardTitle>
              <CardDescription>
                {shortenedUrls.length || 0} links created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shortenedUrls.map(
                  ({ id, original, shortenUrl, clicks }, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <LinkIcon className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-primary truncate">
                                <span>{shortenUrl || `short.ly/${id}`}</span>
                              </p>
                              <Badge
                                variant="secondary"
                                className="flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{clicks}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {truncateUrl(original)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(shortenUrl || `short.ly/${id}`)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <Link
                              href={shortenUrl || `/${id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {index < shortenedUrls.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

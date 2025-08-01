"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { BarChart, BarChart3, Clock, Copy, Link } from "lucide-react";
import BarGraph from "./graph";
import Select from "../dashboard/select";
import { useQuery } from "@tanstack/react-query";
import { statistics } from "@/types";

// const performance = [
//   { month: "01-25", clicks: 350 },
//   { month: "02-25", clicks: 340 },
//   { month: "03-25", clicks: 410 },
//   { month: "04-25", clicks: 420 },
//   { month: "05-25", clicks: 330 },
//   { month: "06-25", clicks: 390 },
//   { month: "07-25", clicks: 320 },
//   { month: "08-25", clicks: 330 },
//   { month: "09-25", clicks: 400 },
//   { month: "10-25", clicks: 460 },
//   { month: "11-25", clicks: 310 },
//   { month: "12-25", clicks: 370 },
// ];

const Statistics = () => {
  const [showChart, setShowChart] = useState(true);
  const totalClicks = 2280;
  const {
    data: statistics,
    isPending,
    error,
  } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      const response = await fetch("/api/statistics");
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      return response.json();
    },
  }) as { data: statistics; isPending: boolean; error: Error | null };

  if (isPending) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Error: {error.message}</div>
    );
  }
  const { all_links, per_links, total_links } = statistics;
  // console.log("Statistics data:", { all_links, per_links, total_links });

  return (
    <div className="space-y-6 w-full p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h1>
        <div className="flex justify-between gap-6 mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-url-blue-violet inline-block" />
              <span className="text-sm font-medium text-url-blue-100">
                Date created
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-url-gray-200 inline-block" />
              <span className="text-sm font-medium text-url-blue-100">
                Top performing
              </span>
            </div>
          </div>
          <div className="w-1/4">
            <Select
              options={[
                { label: "Last 7 days", value: "7" },
                { label: "Last 30 days", value: "30" },
                { label: "Last 90 days", value: "90" },
                { label: "Last 365 days", value: "365" },
              ]}
              onChange={(value) => console.log(value)}
              placeholder="Select time range"
            />
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <Card className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <CardContent className="flex flex-col items-center p-4">
              <BarChart className="w-8 h-8 mb-2 text-url-blue-violet" />
              <span className="text-xs text-url-gray-100">Total Clicks</span>
              <span className="text-2xl font-semibold text-url-blue-100">
                {totalClicks.toLocaleString()}
              </span>
            </CardContent>
          </Card>
          <Card className="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <CardContent className="flex flex-col items-center p-4">
              <BarChart className="w-8 h-8 mb-2 text-url-blue-violet" />
              <span className="text-xs text-url-gray-100">
                Total Links Created
              </span>
              <span className="text-2xl font-semibold text-url-blue-100">
                {total_links}
              </span>
            </CardContent>
          </Card>
        </div>
        {showChart && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-2 shadow-sm relative">
            <BarGraph data={all_links} />
            {/* Hide button */}
            <Button
              className="absolute right-4 -bottom-6 bg-url-blue-violet text-white text-xs px-4 py-1 rounded-full shadow"
              onClick={() => setShowChart(false)}
            >
              Hide Chart ▲
            </Button>
          </div>
        )}
        {!showChart && (
          <Button
            className="mt-2 bg-url-blue-violet text-white text-xs px-4 py-1 rounded-full shadow"
            onClick={() => setShowChart(true)}
          >
            Show Chart ▼
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Latest Links
              </h2>
              <p className="text-sm text-gray-500">
                Recently created short links
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {per_links.map(({ slug_url, total_clicks, created_at }, index) => (
              <LinkCard
                key={index}
                shortUrl={slug_url}
                clicks={total_clicks}
                createdAt={created_at}
              />
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Top Performing
              </h2>
              <p className="text-sm text-gray-500">
                Highest traffic generators
              </p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {per_links
              .filter(({ total_clicks }) => total_clicks > 0)
              .map(({ slug_url, total_clicks, created_at }, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-2 top-8 w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="ml-6">
                    <LinkCard
                      shortUrl={slug_url}
                      clicks={total_clicks}
                      createdAt={created_at}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

type props = {
  shortUrl: string;
  originalUrl?: string;
  clicks: number;
  createdAt: string;
};

const LinkCard = ({ shortUrl, originalUrl = "", clicks, createdAt }: props) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="font-mono text-sm font-medium text-blue-600">
              acurl/{shortUrl}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shortUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy to clipboard"
            >
              <Copy
                className={`w-3 h-3 ${
                  copied ? "text-green-500" : "text-gray-400"
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-gray-500 truncate mb-2">{originalUrl}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>{clicks} clicks</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {typeof createdAt === "string"
                  ? new Date(createdAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// const latestLinks = [
//   {
//     id: 1,
//     shortUrl: "bit.ly/3xK9mL2",
//     originalUrl: "https://example.com/very-long-url-that-needs-shortening",
//     clicks: 127,
//     createdAt: "2 hours ago",
//   },
//   {
//     id: 2,
//     shortUrl: "bit.ly/2wR8nP5",
//     originalUrl: "https://mydomain.com/another-long-url-example",
//     clicks: 89,
//     createdAt: "5 hours ago",
//   },
//   {
//     id: 3,
//     shortUrl: "bit.ly/4kL3mN8",
//     originalUrl: "https://website.com/product-page-with-parameters",
//     clicks: 43,
//     createdAt: "1 day ago",
//   },
// ];

// const topLinks = [
//   {
//     id: 1,
//     shortUrl: "bit.ly/1aB2cD3",
//     originalUrl: "https://popular-site.com/trending-content",
//     clicks: 2847,
//     createdAt: "3 weeks ago",
//   },
//   {
//     id: 2,
//     shortUrl: "bit.ly/5eF6gH7",
//     originalUrl: "https://marketing-campaign.com/special-offer",
//     clicks: 1923,
//     createdAt: "1 month ago",
//   },
//   {
//     id: 3,
//     shortUrl: "bit.ly/9iJ0kL1",
//     originalUrl: "https://blog-post.com/viral-article-title",
//     clicks: 1456,
//     createdAt: "2 weeks ago",
//   },
// ];

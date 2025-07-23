"use client";

import React, { useState, useMemo } from "react";
import {
  Link as LinkIcon,
  Eye,
  TrendingUp,
  Download,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getLinks } from "../actions";
import { links } from "@/types";
import Toolbar from "./toolbar";
import LinkCard from "./card";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "clicks-desc"
  | "clicks-asc"
  | "recent"
  | "oldest"
  | "original-asc"
  | "original-desc";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<SortOption>("recent");
  // const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
console.log(filter)
  const {
    data: shortenedUrls = [],
    isFetching,
  } = useQuery({
    queryKey: ["links"],
    queryFn: async () => getLinks(),
  }) as {
    data: links[];
    refetch: () => void;
    isFetching: boolean;
  };

  const filteredAndSortedLinks = useMemo(() => {
    const filtered = shortenedUrls.filter((link) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        link.original?.toLowerCase().includes(searchLower) ||
        link.shortenUrl?.toLowerCase().includes(searchLower) ||
        link.id?.toString().includes(searchLower)
      );
    });
const sorted = [...filtered];
  switch (filter) {
    case "name-asc":
      sorted.sort((a, b) =>
        (a.shortenUrl ?? "").localeCompare(b.shortenUrl ?? "", undefined, { sensitivity: 'base' })
      );
      break;
    case "name-desc":
      sorted.sort((a, b) =>
        (b.shortenUrl ?? "").localeCompare(a.shortenUrl ?? "", undefined, { sensitivity: 'base' })
      );
      break;
    case "clicks-desc":
      sorted.sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
      break;
    case "clicks-asc":
      sorted.sort((a, b) => (a.clicks ?? 0) - (b.clicks ?? 0));
      break;
    case "recent":
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "oldest":
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case "original-asc":
      sorted.sort((a, b) =>
        (a.original ?? "").localeCompare(b.original ?? "", undefined, { sensitivity: 'base' })
      );
      break;
    case "original-desc":
      sorted.sort((a, b) =>
        (b.original ?? "").localeCompare(a.original ?? "", undefined, { sensitivity: 'base' })
      );
      break;
    default:
      break;
  }

  return sorted;
}, [shortenedUrls, searchQuery, filter]);

  const totalClicks = shortenedUrls.reduce(
    (sum, link) => sum + (link.clicks || 0),
    0
  );
  const avgClicks =
    shortenedUrls.length > 0
      ? Math.round(totalClicks / shortenedUrls.length)
      : 0;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }


  const exportData = () => {
    const csvContent = [
      ["Short URL", "Original URL", "Clicks", "ID"].join(","),
      ...shortenedUrls.map((link) =>
        [
          link.shortenUrl || `short.ly/${link.id}`,
          link.original,
          link.clicks || 0,
          link.createdAt || 0,
          link.id,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shortened-links.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 w-full p-4 bg-gradient-to-br from-cyan-50 via-blue-100 to-indigo-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ">
        <Card className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow border border-white/20 transition-all duration-300">
          <CardContent className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Total Links</p>
              <p className="text-3xl font-bold text-slate-900">
                {shortenedUrls.length}
              </p>
              <p className="text-xs text-blue-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {Math.round((shortenedUrls.length / 100) * 10)}% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-400 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow border border-white/20 transition-all duration-300">
          <CardContent className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Total Clicks</p>
              <p className="text-3xl font-bold text-slate-900">
                {totalClicks.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />+
                {Math.round((totalClicks / 100) * 10)}% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-400 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow border border-white/20  transition-all duration-300">
          <CardContent className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Avg. Clicks</p>
              <p className="text-3xl font-bold text-slate-900">{avgClicks}</p>
              <p className="text-xs text-blue-600 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {Math.round((avgClicks / 100) * 10)}% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-400 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow border border-white/20  transition-all duration-300">
          <CardContent className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Avg. Clicks</p>
              <p className="text-3xl font-bold text-slate-900">{avgClicks}</p>
              <p className="text-xs text-blue-600 flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {Math.round((avgClicks / 100) * 10)}% this week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-400 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-slate-900 flex items-center">
                Your Shortened Links
              </CardTitle>
              <CardDescription className="l px-1 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                {filteredAndSortedLinks.length} of {shortenedUrls.length} links
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          <Toolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setFilter={setFilter}
          />
        </CardHeader>

        <CardContent>
          {filteredAndSortedLinks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery ? "No matching links" : "No links yet"}
              </div>
              <p className="text-slate-600 max-w-sm mx-auto">
                {searchQuery
                  ? "Try adjusting your search terms or filters"
                  : "Create your first shortened link to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredAndSortedLinks.map(
                ({ id, original, shortenUrl, clicks, createdAt }, index) => (
                 <LinkCard
                 key={index}
                  id={id}
                  original={original}
                  shortenUrl={shortenUrl}
                  clicks={clicks}
                  createdAt={createdAt}
                 />
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

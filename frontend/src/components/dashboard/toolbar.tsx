import { Search } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";
import Select from "./select";
type SortOption =
  | "name-asc"
  | "name-desc"
  | "clicks-desc"
  | "clicks-asc"
  | "recent"
  | "oldest"
  | "original-asc"
  | "original-desc";

const filters: { label: string; value: SortOption }[] = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Clicks (Descending)", value: "clicks-desc" },
  { label: "Clicks (Ascending)", value: "clicks-asc" },
  { label: "Most Recent", value: "recent" },
  { label: "Oldest", value: "oldest" },
  { label: "Original (A-Z)", value: "original-asc" },
  { label: "Original (Z-A)", value: "original-desc" },
];

interface props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: SortOption) => void;
}

const Toolbar = ({ searchQuery, setSearchQuery, setFilter }:props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
               />
      </div>
      <div className="w-1/4">
        <Select
          options={filters}
          onChange={(value) => setFilter(value as SortOption)}
          placeholder="Sort by"
        />
      </div>
    </div>
  );
};

export default Toolbar;

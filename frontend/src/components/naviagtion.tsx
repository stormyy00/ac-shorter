"use client";
import { Bell, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

const Navigation = () => {
  const pathname = usePathname();
  return (
    <div className="flex items-center bg-url-white-100 sticky top-0 justify-between border-b z-20 p-4 max-w-7xl ">
      <div className="text-3xl font-bold text-gray-900">
        {pathname
          .split("/")
          .pop()
          ?.toLowerCase()
          .replace(/^./, (c) => c.toUpperCase())}
      </div>
      <div className="flex items-center gap-4">
        <Button className="p-2 bg-url-white-200 backdrop-blur-sm border border-purple-200 rounded-xl hover:bg-white transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
        </Button>
        <Button className="p-2 bg-url-white-200 text-url-gray-100 backdrop-blur-sm border border-purple-200 rounded-xl hover:bg-white transition-colors">
          <Plus className="w-5 h-5 " />
          Create Link
        </Button>
      </div>
    </div>
  );
};

export default Navigation;

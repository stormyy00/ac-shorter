"use client";
import { useSession, signOut } from "@/utils/auht-client";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { LayoutGrid, LogOut } from "lucide-react";

const Navigation = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        <div className="text-white text-xl font-bold tracking-tight select-none">
          AC Shorter
        </div>
        <div>
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-gray-200 hover:text-white px-3 py-1 rounded-xl transition"
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline font-medium text-sm">
                  Dashboard
                </span>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 text-gray-300 hover:text-red-400 transition"
                onClick={() => signOut()}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline font-medium text-sm">
                  Sign Out
                </span>
              </Button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="text-gray-200 hover:text-white px-4 py-1 rounded-xl font-medium transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

"use client";

import { TABS } from "@/data/navigation";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, PencilRuler, SkipBack, ToolCase } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";


const Navigation = () => {
  const path = usePathname().split("/");
  const navParent = path[1];
  const router = useRouter();

  const NAVTABS = TABS[navParent]?.tabs ?? [];
  const generalPath = `${path.slice(0, 2).join("/")}/dashboard/${path.slice(3).join("/")}`;
  // const user = {
  //   name: path[2] || "User",
  //   email: "user@email.com",
  //   role: "Director",
  //   avatar: "",
  // };

  const { open, toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className={`
        h-screen bg-white border-r flex justify-between rounded-r-3xl shadow-xl transition-all z-30
        ${open ? "" : "w-[70px] min-w-[56px]"}
      `}
    >
      <SidebarHeader className={`p-5 ${!open ? "items-center px-2 py-4" : ""}`}>
        <div
          className={`flex items-center gap-3 mb-3 ${!open && "justify-center"}`}
        >
          <div className="bg-gradient-to-br from-blue-500 to-indigo-400 rounded-2xl h-12 w-12 flex items-center justify-center shadow">
            <PencilRuler className="h-6 w-6 text-white" />
          </div>
          {open && (
            <span className="font-bold text-lg text-blue-700">ACRL</span>
          )}
        </div>
        {open && (
          <>
            <div className="text-xs text-gray-4800">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {/* <div className="font-bold text-orange-500 text-lg">
              Hello {user.name}!
            </div> */}
          </>
        )}
      </SidebarHeader>

      <SidebarContent className="flex-1 justify-center px-2 py-1">
        <div className="flex flex-col gap-0.5">
          {NAVTABS.map(({ link, name, icon }, idx) => (
            <div
              key={idx}
              onClick={() => router.push(link)}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all text-[16px]
                ${
                  generalPath === link
                    ? "bg-gradient-to-r from-orange-100 to-amber-50 text-indigo-500 shadow border-l-4 border-orange-400"
                    : "hover:bg-indigo-100 hover:text-indigo-600 text-url-gray-100 "
                }
                ${!open && "justify-center"}
              `}
            >
              <span className={`${!open && "mx-auto"}`}>{icon}</span>
              {open && (
                <span className="ml-2 mr-1 flex items-center">{name}</span>
              )}
            </div>
          ))}
        </div>
      </SidebarContent>
      <SidebarSeparator className="mx-4 my-1" />
      <SidebarFooter className="px-4 pb-6 pt-0 flex flex-col gap-2">
        <div className="flex flex-col md:gap-0 text-sm py-2">

          <SidebarLink
            open={open}
            href="/resources"
            icon={<ToolCase size={18} />}
            label="Resources"
          />
          <SidebarLink
            open={open}
            href="/"
            icon={<Home size={18} />}
            label="Back to Home"
          />
          <span
            onClick={toggleSidebar}
            className={`${open ? "h-7 -ml-1.5" : "mx-auto h-6 -ml-0.5 my-1"} flex items-center gap-1 py-0 font-semibold  rounded-md transition-colors text-url-gray-100 hover:text-indigo-500`}
          >
            <span className={`${!open && "mx-auto"}`}>
              <SidebarTrigger
                className={`hover:bg-inherit hover:text-current `}
              />
            </span>
            {open && <span>Close Sidebar</span>}
          </span>
          <span
            className={`flex items-center gap-2 py-0 font-semibold  rounded-md text-url-gray-100 hover:text-red-500 transition-colors  ${open ? "h-7 pr-3" : "mx-auto h-6 my-1"}`}
          >
            <SkipBack size={18} />
            {open && <span>Sign out</span>}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

function SidebarLink({
  open,
  href,
  icon,
  label,
}: {
  open: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2  py-4 rounded-md font-semibold transition-colors
        ${open ? "h-7 pr-3" : "mx-auto h-6 my-1"}
        text-url-gray-100 hover:text-indigo-500 hover:bg-indigo-100
      `}
    >
      <span className={`${!open && "mx-auto"}`}>{icon}</span>
      {open && label}
    </Link>
  );
}

export default Navigation;

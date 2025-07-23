import {
  Eye,
  ChartArea,
} from "lucide-react";

interface Tab {
  name: string;
  link: string;
  icon: JSX.Element;
  requiresOrg?: boolean;
  requiresOwner?: boolean;
  subtabs?: Tab[];
}

interface Collapsible {
  expand: boolean;
  tabs: Tab[];
}
type Tabs = Record<string, Collapsible>;

export const TABS: Tabs = {
  dashboard: {
    expand: true,
    tabs: [
      {
        name: "Dashboard",
        link: "/dashboard",
        icon: <Eye />,
      },
      {
        name: "Statistics",
        link: "/dashboard/statistics",
        icon: <ChartArea />,
      },
      
    ],
  },
};

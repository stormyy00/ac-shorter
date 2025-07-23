
import Sidebar from "@/components/sidebar";
import Provider from "@/components/provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navigation from "@/components/naviagtion";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  return (
    <Provider>
      <SidebarProvider>
        <Sidebar />
        <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-cyan-50 via-blue-100 to-indigo-200">
          <Navigation />
          {children}
        </div>
      </SidebarProvider>
    </Provider>
  );
};

export default Layout;

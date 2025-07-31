import "../../bookbook/globals.css";
import { DashboardProvider } from "@/app/admin/dashboard/_hooks/useDashboard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  );
}

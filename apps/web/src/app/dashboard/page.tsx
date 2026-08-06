import type { Metadata } from "next";

import { DashboardShell } from "@/features/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Command Centre | CCSA Zora",
  description: "CCSA Zora institutional agricultural intelligence workspace.",
};

export default function DashboardPage() {
  return <DashboardShell />;
}

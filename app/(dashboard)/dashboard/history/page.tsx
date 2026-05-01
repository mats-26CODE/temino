import { redirect } from "next/navigation";

export default function DashboardHistoryRedirectPage() {
  redirect("/dashboard/trips?tab=past");
}

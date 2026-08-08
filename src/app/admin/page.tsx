import { DashboardPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return <DashboardPage snapshot={await getSnapshot()} />;
}

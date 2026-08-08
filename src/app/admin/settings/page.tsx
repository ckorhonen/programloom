import { SettingsPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function SettingsRoute() {
  return <SettingsPage snapshot={await getSnapshot()} />;
}

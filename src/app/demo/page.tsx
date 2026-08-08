import { DemoCenterPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function DemoRoute() {
  return <DemoCenterPage snapshot={await getSnapshot()} />;
}

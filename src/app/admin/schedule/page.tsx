import { SchedulePage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function ScheduleRoute() {
  return <SchedulePage snapshot={await getSnapshot()} />;
}

import { PublicSchedulePage } from "@/components/programloom";
import { serializePublicSnapshot } from "@/domain";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function PublicScheduleRoute() {
  return <PublicSchedulePage snapshot={serializePublicSnapshot(await getSnapshot())} />;
}

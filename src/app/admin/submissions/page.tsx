import { SubmissionsPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function SubmissionsRoute() {
  return <SubmissionsPage snapshot={await getSnapshot()} />;
}

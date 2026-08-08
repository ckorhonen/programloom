import { CommunicationsPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function CommunicationsRoute() {
  return <CommunicationsPage snapshot={await getSnapshot()} />;
}

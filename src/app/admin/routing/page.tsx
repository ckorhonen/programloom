import { RoutingPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function RoutingRoute() {
  return <RoutingPage snapshot={await getSnapshot()} />;
}

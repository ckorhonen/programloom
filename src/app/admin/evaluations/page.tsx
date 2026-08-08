import { EvaluationsPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function EvaluationsRoute() {
  return <EvaluationsPage snapshot={await getSnapshot()} />;
}

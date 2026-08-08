import { EvaluatorDemoPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function EvaluatorRoute() {
  return <EvaluatorDemoPage snapshot={await getSnapshot()} />;
}

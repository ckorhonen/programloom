import { OnboardingPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function OnboardingRoute() {
  return <OnboardingPage snapshot={await getSnapshot()} />;
}

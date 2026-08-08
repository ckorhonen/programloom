import { PortalPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function PortalRoute({ params }: { params: Promise<{ speakerId: string }> }) {
  const { speakerId } = await params;
  return <PortalPage snapshot={await getSnapshot()} speakerId={speakerId} />;
}

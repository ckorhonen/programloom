import { PublicSpeakersPage } from "@/components/programloom";
import { serializePublicSnapshot } from "@/domain";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function PublicSpeakersRoute() {
  return <PublicSpeakersPage snapshot={serializePublicSnapshot(await getSnapshot())} />;
}

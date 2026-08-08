import { FormsPage } from "@/components/programloom";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function FormsRoute() {
  return <FormsPage />;
}

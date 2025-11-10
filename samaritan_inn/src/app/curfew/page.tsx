import { requireUser } from "@/lib/auth";
import CurfewExtensionClient from "./CurfewExtensionClient";


export default async function CurfewPage() {
  //  Only logged-in users (role: user) can view this page
  const user = await requireUser();
  return <CurfewExtensionClient />;
}

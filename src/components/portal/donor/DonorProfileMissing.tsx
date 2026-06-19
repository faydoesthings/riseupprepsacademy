import { HeartHandshake } from "lucide-react";
import PortalListPage from "@/components/portal/PortalListPage";

export default function DonorProfileMissing() {
  return (
    <PortalListPage>
      <div className="portal-empty-state">
        <HeartHandshake className="w-12 h-12 text-[#F78C1F]/40 mx-auto mb-4" aria-hidden />
        <h3 className="text-lg font-bold text-white mb-2">Donor profile not found</h3>
        <p className="text-white/45 text-sm max-w-sm mx-auto">
          Your account is not linked to a donor profile yet. Contact the academy to set up your
          giving account.
        </p>
      </div>
    </PortalListPage>
  );
}

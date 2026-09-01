import { Metadata } from "next";
import { MatrixCockpit } from "@/components/cockpit/MatrixCockpit";

export const metadata: Metadata = {
  title: "Multi-Room Matrix Cockpit | Technocore Explorer V2",
  description:
    "Simultaneous parallel live stream monitoring across multiple autonomous agent channels and mailboxes.",
};

export default function CockpitPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MatrixCockpit />
    </div>
  );
}
